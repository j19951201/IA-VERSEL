using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Sockets;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;
using System.Windows.Forms;

// =====================================================================
// DATA MODELS
// =====================================================================

internal sealed class MonitorConfig
{
    public string ProjectRoot = @"C:\Users\joanc\Downloads\Nueva carpeta (6)";
    public string StartScriptRelativePath = @"scripts\start_ai_stack.ps1";
    public string ProxyBaseUrl = "http://127.0.0.1:11436";
    public string ProxyToken = "corvinus-hard-token";
    public string Model = "corvinus-unico:latest";
    public string AppChatUrl = "http://127.0.0.1:3000/api/chat";
    public int IntervalSeconds = 90;
    public int RequestTimeoutSeconds = 25;
    public bool AutoStartStack = true;
    public bool AutoStartAppDev = true;
    public int AppDevPort = 3000;
}

internal sealed class CheckResult
{
    public string Name;
    public bool Ok;
    public string Detail;
    public string ResponsePreview;

    public CheckResult(string name, bool ok, string detail, string responsePreview)
    {
        Name = name;
        Ok = ok;
        Detail = detail;
        ResponsePreview = responsePreview != null ? responsePreview : "";
    }
}

internal sealed class HttpResult
{
    public bool Ok;
    public string Body;
    public string Detail;

    public HttpResult(bool ok, string body, string detail)
    {
        Ok = ok;
        Body = body;
        Detail = detail;
    }
}

internal sealed class ApiKeyEntry
{
    public string Id = "";
    public string Name = "";
    public string Key = "";
    public string AppName = "";
    public string CreatedAt = "";
    public string LastUsed = "";
}

internal sealed class ConnectedApp
{
    public string Name = "";
    public string Url = "";
    public string ApiKey = "";
    public string AddedAt = "";
    public string Notes = "";
}

// =====================================================================
// MONITOR LOGIC
// =====================================================================

internal static class MonitorLogic
{
    private static readonly JavaScriptSerializer Json = new JavaScriptSerializer();

    public static MonitorConfig LoadConfig(string configPath)
    {
        var config = new MonitorConfig();
        if (!File.Exists(configPath)) return config;
        try
        {
            var content = File.ReadAllText(configPath, Encoding.UTF8);
            var map = Json.Deserialize<Dictionary<string, object>>(content);
            if (map == null) return config;
            ApplyStr(map, "ProjectRoot",            v => config.ProjectRoot = v);
            ApplyStr(map, "StartScriptRelativePath", v => config.StartScriptRelativePath = v);
            ApplyStr(map, "ProxyBaseUrl",            v => config.ProxyBaseUrl = v.TrimEnd('/'));
            ApplyStr(map, "ProxyToken",              v => config.ProxyToken = v);
            ApplyStr(map, "Model",                   v => config.Model = v);
            ApplyStr(map, "AppChatUrl",              v => config.AppChatUrl = v);
            ApplyInt(map, "IntervalSeconds",         v => config.IntervalSeconds = v);
            ApplyInt(map, "RequestTimeoutSeconds",   v => config.RequestTimeoutSeconds = v);
            ApplyBool(map, "AutoStartStack",         v => config.AutoStartStack = v);
            ApplyBool(map, "AutoStartAppDev",        v => config.AutoStartAppDev = v);
            ApplyInt(map, "AppDevPort",              v => config.AppDevPort = v);
        }
        catch { }
        return config;
    }

    public static List<CheckResult> RunChecks(MonitorConfig config)
    {
        var results = new List<CheckResult>();
        using (var client = new HttpClient())
        {
            client.Timeout = TimeSpan.FromSeconds(Math.Max(5, config.RequestTimeoutSeconds));

            // 1. Proxy health
            var healthUrl = config.ProxyBaseUrl.TrimEnd('/') + "/health";
            var health = SafeGet(client, healthUrl);
            var healthOk = health.Ok && health.Body.IndexOf("\"ok\":true", StringComparison.OrdinalIgnoreCase) >= 0;
            results.Add(new CheckResult(
                "Cerebro GGUF /health",
                healthOk,
                healthOk ? "Proxy y upstream responden" : health.Detail,
                health.Body));

            // 2. API key + generate
            if (string.IsNullOrWhiteSpace(config.ProxyToken))
            {
                results.Add(new CheckResult("API key/token + generate", false, "Token vacio en configuracion", ""));
            }
            else
            {
                var genPayload = Json.Serialize(new Dictionary<string, object>
                {
                    { "model", config.Model },
                    { "prompt", "Responde SOLO MONITOR_OK" },
                    { "stream", false }
                });
                var genUrl = config.ProxyBaseUrl.TrimEnd('/') + "/api/generate";
                var gen = SafePost(client, genUrl, genPayload, config.ProxyToken);
                var authOk = gen.Ok && gen.Body.IndexOf("MONITOR_OK", StringComparison.OrdinalIgnoreCase) >= 0;
                results.Add(new CheckResult(
                    "API key/token + generate",
                    authOk,
                    authOk ? "Token funcional y modelo responde" : gen.Detail,
                    ExtractResponseField(gen.Body)));
            }

            // 3. App chat
            if (!string.IsNullOrWhiteSpace(config.AppChatUrl))
            {
                var appPayload = Json.Serialize(new Dictionary<string, object>
                {
                    { "prompt", "Confirma conectividad brevemente" }
                });
                var app = SafePost(client, config.AppChatUrl, appPayload, null);
                var appOk = app.Ok && app.Body.IndexOf("response", StringComparison.OrdinalIgnoreCase) >= 0;
                results.Add(new CheckResult(
                    "Aplicacion conectada al cerebro",
                    appOk,
                    appOk ? "api/chat responde y enlaza backend" : app.Detail,
                    ExtractResponseField(app.Body)));
            }
        }
        return results;
    }

    public static HttpResult SafeGet(HttpClient client, string url)
    {
        try
        {
            using (var response = client.GetAsync(url).GetAwaiter().GetResult())
            {
                var body = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                var detail = "HTTP " + (int)response.StatusCode + " " + response.ReasonPhrase;
                if (!response.IsSuccessStatusCode) detail += " | " + TrimText(body, 220);
                return new HttpResult(response.IsSuccessStatusCode, body, detail);
            }
        }
        catch (Exception ex) { return new HttpResult(false, "", ex.Message); }
    }

    public static HttpResult SafePost(HttpClient client, string url, string payload, string bearerToken)
    {
        try
        {
            using (var request = new HttpRequestMessage(HttpMethod.Post, url))
            {
                request.Headers.ExpectContinue = false;
                request.Content = new StringContent(payload, Encoding.UTF8, "application/json");
                if (!string.IsNullOrWhiteSpace(bearerToken))
                    request.Headers.TryAddWithoutValidation("Authorization", "Bearer " + bearerToken);
                using (var response = client.SendAsync(request).GetAwaiter().GetResult())
                {
                    var body = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                    var detail = "HTTP " + (int)response.StatusCode + " " + response.ReasonPhrase;
                    if (!response.IsSuccessStatusCode) detail += " | " + TrimText(body, 220);
                    return new HttpResult(response.IsSuccessStatusCode, body, detail);
                }
            }
        }
        catch (Exception ex) { return new HttpResult(false, "", ex.Message); }
    }

    public static void AppendLog(string logPath, string timestamp, List<CheckResult> checks, bool allOk)
    {
        try
        {
            var sb = new StringBuilder();
            sb.Append('[').Append(timestamp).Append("] ").Append(allOk ? "GLOBAL=OK" : "GLOBAL=FAIL");
            foreach (var c in checks) sb.Append(" | ").Append(c.Name).Append('=').Append(c.Ok ? "OK" : "FAIL");
            File.AppendAllText(logPath, sb.ToString() + Environment.NewLine, Encoding.UTF8);
        }
        catch { }
    }

    public static bool LaunchStack(string startScript)
    {
        try
        {
            if (!File.Exists(startScript)) return false;
            var psi = new ProcessStartInfo();
            psi.FileName = "powershell.exe";
            psi.Arguments = "-NoProfile -ExecutionPolicy Bypass -File \"" + startScript + "\"";
            psi.CreateNoWindow = true;
            psi.UseShellExecute = false;
            Process.Start(psi);
            return true;
        }
        catch { return false; }
    }

    public static bool EnsureAppDev(MonitorConfig config)
    {
        try
        {
            if (IsAppChatReady(config)) return true;
            if (IsTcpPortOpen("127.0.0.1", config.AppDevPort, 800) && WaitForAppChatReady(config, 15)) return true;
            if (IsTcpPortOpen("127.0.0.1", config.AppDevPort, 800))
            {
                TryStopProcessOnPort(config.AppDevPort);
                Thread.Sleep(1200);
            }
            var psi = new ProcessStartInfo();
            psi.FileName = "powershell.exe";
            psi.WorkingDirectory = config.ProjectRoot;
            psi.Arguments = "-NoProfile -ExecutionPolicy Bypass -Command \"$env:INTERNAL_AI_API_URL='"
                + config.ProxyBaseUrl.TrimEnd('/') + "/api/generate'"
                + "; $env:INTERNAL_AI_AUTH_HEADER='Authorization'"
                + "; $env:INTERNAL_AI_AUTH_SCHEME='Bearer'"
                + "; $env:INTERNAL_AI_API_KEY='" + EscapePs(config.ProxyToken) + "'"
                + "; $env:INTERNAL_AI_TIMEOUT_MS='60000'"
                + "; $env:INTERNAL_AI_DEFAULT_MODEL='" + EscapePs(config.Model) + "'"
                + "; npx --yes vercel dev --listen " + config.AppDevPort + "\"";
            psi.CreateNoWindow = true;
            psi.UseShellExecute = false;
            Process.Start(psi);
            return WaitForAppChatReady(config, 25);
        }
        catch { return false; }
    }

    private static void TryStopProcessOnPort(int port)
    {
        try
        {
            var ps = new ProcessStartInfo();
            ps.FileName = "powershell.exe";
            ps.Arguments = "-NoProfile -ExecutionPolicy Bypass -Command \"$c=Get-NetTCPConnection -LocalPort "
                + port + " -State Listen -ErrorAction SilentlyContinue; if($c){$ids=@($c|Select-Object -ExpandProperty OwningProcess -Unique);foreach($id in $ids){try{Stop-Process -Id $id -Force -ErrorAction SilentlyContinue}catch{}}}\"";
            ps.CreateNoWindow = true;
            ps.UseShellExecute = false;
            using (var proc = Process.Start(ps))
                if (proc != null) proc.WaitForExit(6000);
        }
        catch { }
    }

    public static bool IsTcpPortOpen(string host, int port, int timeoutMs)
    {
        try
        {
            using (var tc = new TcpClient())
            {
                var ar = tc.BeginConnect(host, port, null, null);
                if (!ar.AsyncWaitHandle.WaitOne(timeoutMs)) return false;
                tc.EndConnect(ar);
                return true;
            }
        }
        catch { return false; }
    }

    private static bool WaitForAppChatReady(MonitorConfig config, int seconds)
    {
        for (var i = 0; i < seconds; i++) { Thread.Sleep(1000); if (IsAppChatReady(config)) return true; }
        return false;
    }

    private static bool IsAppChatReady(MonitorConfig config)
    {
        try
        {
            using (var client = new HttpClient())
            {
                client.Timeout = TimeSpan.FromSeconds(8);
                var payload = Json.Serialize(new Dictionary<string, object> { { "prompt", "ping" } });
                using (var request = new HttpRequestMessage(HttpMethod.Post, config.AppChatUrl))
                {
                    request.Headers.ExpectContinue = false;
                    request.Content = new StringContent(payload, Encoding.UTF8, "application/json");
                    using (var response = client.SendAsync(request).GetAwaiter().GetResult())
                    {
                        var body = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                        return response.IsSuccessStatusCode && body.IndexOf("response", StringComparison.OrdinalIgnoreCase) >= 0;
                    }
                }
            }
        }
        catch { return false; }
    }

    private static string ExtractResponseField(string json)
    {
        if (string.IsNullOrEmpty(json)) return "";
        try
        {
            var map = Json.Deserialize<Dictionary<string, object>>(json);
            if (map != null)
            {
                object v;
                if (map.TryGetValue("response", out v) && v != null)
                {
                    var s = Convert.ToString(v);
                    return s.Length > 250 ? s.Substring(0, 250) + "..." : s;
                }
            }
        }
        catch { }
        return json.Length > 250 ? json.Substring(0, 250) + "..." : json;
    }

    public static string TrimText(string text, int maxLength)
    {
        if (string.IsNullOrEmpty(text)) return "";
        var n = text.Replace("\r", " ").Replace("\n", " ").Trim();
        return n.Length <= maxLength ? n : n.Substring(0, maxLength) + "...";
    }

    private static string EscapePs(string value)
    {
        return string.IsNullOrEmpty(value) ? "" : value.Replace("'", "''");
    }

    private static void ApplyStr(Dictionary<string, object> map, string key, Action<string> assign)
    {
        object v; if (!map.TryGetValue(key, out v) || v == null) return;
        var t = Convert.ToString(v); if (!string.IsNullOrWhiteSpace(t)) assign(t);
    }

    private static void ApplyInt(Dictionary<string, object> map, string key, Action<int> assign)
    {
        object v; if (!map.TryGetValue(key, out v) || v == null) return;
        int p; if (int.TryParse(Convert.ToString(v), out p) && p > 0) assign(p);
    }

    private static void ApplyBool(Dictionary<string, object> map, string key, Action<bool> assign)
    {
        object v; if (!map.TryGetValue(key, out v) || v == null) return;
        bool p; if (bool.TryParse(Convert.ToString(v), out p)) assign(p);
    }
}

// =====================================================================
// API KEY STORE
// =====================================================================

internal static class ApiKeyStore
{
    private static readonly JavaScriptSerializer Json = new JavaScriptSerializer();

    public static string StorePath
    {
        get { return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "EliosMind2B", "api_keys.json"); }
    }

    public static List<ApiKeyEntry> Load()
    {
        try
        {
            if (!File.Exists(StorePath)) return new List<ApiKeyEntry>();
            var raw = File.ReadAllText(StorePath, Encoding.UTF8);
            var list = Json.Deserialize<List<ApiKeyEntry>>(raw);
            return list != null ? list : new List<ApiKeyEntry>();
        }
        catch { return new List<ApiKeyEntry>(); }
    }

    public static void Save(List<ApiKeyEntry> entries)
    {
        try
        {
            var dir = Path.GetDirectoryName(StorePath);
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
            File.WriteAllText(StorePath, Json.Serialize(entries), Encoding.UTF8);
        }
        catch { }
    }

    public static string GenerateKey()
    {
        var bytes = new byte[24];
        using (var rng = new RNGCryptoServiceProvider())
            rng.GetBytes(bytes);
        return "emb2-" + BitConverter.ToString(bytes).Replace("-", "").ToLowerInvariant();
    }
}

// =====================================================================
// CONNECTED APPS STORE
// =====================================================================

internal static class AppStore
{
    private static readonly JavaScriptSerializer Json = new JavaScriptSerializer();

    public static string StorePath
    {
        get { return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "EliosMind2B", "connected_apps.json"); }
    }

    public static List<ConnectedApp> Load()
    {
        try
        {
            if (!File.Exists(StorePath)) return new List<ConnectedApp>();
            var raw = File.ReadAllText(StorePath, Encoding.UTF8);
            var list = Json.Deserialize<List<ConnectedApp>>(raw);
            return list != null ? list : new List<ConnectedApp>();
        }
        catch { return new List<ConnectedApp>(); }
    }

    public static void Save(List<ConnectedApp> apps)
    {
        try
        {
            var dir = Path.GetDirectoryName(StorePath);
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
            File.WriteAllText(StorePath, Json.Serialize(apps), Encoding.UTF8);
        }
        catch { }
    }
}

// =====================================================================
// THEME
// =====================================================================

internal static class Th
{
    public static readonly Color BgMain    = Color.FromArgb(13,  17,  35);
    public static readonly Color BgCard    = Color.FromArgb(22,  33,  62);
    public static readonly Color BgHeader  = Color.FromArgb(10,  22,  48);
    public static readonly Color BgInput   = Color.FromArgb(30,  42,  70);
    public static readonly Color Accent    = Color.FromArgb(0,  175, 155);
    public static readonly Color Ok        = Color.FromArgb(46,  204, 113);
    public static readonly Color Fail      = Color.FromArgb(231,  76,  60);
    public static readonly Color Pending   = Color.FromArgb(241, 196,  15);
    public static readonly Color TextPri   = Color.FromArgb(236, 240, 241);
    public static readonly Color TextSec   = Color.FromArgb(149, 165, 166);
    public static readonly Color Border    = Color.FromArgb(40,   55,  90);
    public static readonly Color BtnBlue   = Color.FromArgb(0,   110, 180);
    public static readonly Color BtnRed    = Color.FromArgb(180,  50,  40);
    public static readonly Color BtnGreen  = Color.FromArgb(30,  130,  80);
    public static readonly Color BtnPurple = Color.FromArgb(80,   50, 130);

    public static readonly Font FTitle = new Font("Segoe UI", 20f, FontStyle.Bold);
    public static readonly Font FH2    = new Font("Segoe UI", 13f, FontStyle.Bold);
    public static readonly Font FH3    = new Font("Segoe UI", 11f, FontStyle.Bold);
    public static readonly Font FBody  = new Font("Segoe UI", 9.5f);
    public static readonly Font FSmall = new Font("Segoe UI", 8.5f);
    public static readonly Font FMono  = new Font("Consolas",  9f);

    public static Button Btn(string text, Color bg, int w, int h)
    {
        var b = new Button
        {
            Text      = text,
            BackColor = bg,
            ForeColor = TextPri,
            FlatStyle = FlatStyle.Flat,
            Font      = FBody,
            Size      = new Size(w, h),
            Cursor    = Cursors.Hand
        };
        b.FlatAppearance.BorderSize = 0;
        b.FlatAppearance.MouseOverBackColor = ControlPaint.Light(bg, 0.25f);
        return b;
    }

    public static Label Lbl(string text, Font font, Color color)
    {
        return new Label { Text = text, Font = font, ForeColor = color, BackColor = Color.Transparent, AutoSize = true };
    }

    public static TextBox TxtBox(int x, int y, int w)
    {
        return new TextBox { Location = new Point(x, y), Size = new Size(w, 26), BackColor = BgInput, ForeColor = TextPri, BorderStyle = BorderStyle.FixedSingle, Font = FBody };
    }
}

// =====================================================================
// SPLASH FORM
// =====================================================================

internal sealed class SplashForm : Form
{
    private readonly ProgressBar _bar;
    private int _tick = 0;

    public SplashForm()
    {
        FormBorderStyle = FormBorderStyle.None;
        StartPosition   = FormStartPosition.CenterScreen;
        Size            = new Size(520, 300);
        BackColor       = Th.BgMain;
        TopMost         = true;

        var title = new Label
        {
            Text      = "EliosMind 2B",
            Font      = Th.FTitle,
            ForeColor = Th.Accent,
            TextAlign = ContentAlignment.MiddleCenter,
            AutoSize  = false,
            Size      = new Size(520, 70),
            Location  = new Point(0, 55)
        };
        var sub = new Label
        {
            Text      = "BIENVENIDO JOANCARLOS CASADO NOVA",
            Font      = Th.FBody,
            ForeColor = Th.TextSec,
            TextAlign = ContentAlignment.MiddleCenter,
            AutoSize  = false,
            Size      = new Size(520, 28),
            Location  = new Point(0, 135)
        };
        var ver = new Label
        {
            Text      = "v1.1.0",
            Font      = Th.FSmall,
            ForeColor = Th.TextSec,
            TextAlign = ContentAlignment.MiddleCenter,
            AutoSize  = false,
            Size      = new Size(520, 20),
            Location  = new Point(0, 167)
        };
        _bar = new ProgressBar
        {
            Minimum  = 0,
            Maximum  = 100,
            Value    = 0,
            Style    = ProgressBarStyle.Continuous,
            Size     = new Size(420, 8),
            Location = new Point(50, 222)
        };
        var loading = new Label
        {
            Text      = "Iniciando sistema...",
            Font      = Th.FSmall,
            ForeColor = Th.TextSec,
            TextAlign = ContentAlignment.MiddleCenter,
            AutoSize  = false,
            Size      = new Size(520, 20),
            Location  = new Point(0, 242)
        };
        Controls.AddRange(new Control[] { title, sub, ver, _bar, loading });
        Paint += (s, e) =>
        {
            using (var pen = new Pen(Th.Accent, 2))
                e.Graphics.DrawRectangle(pen, 0, 0, Width - 1, Height - 1);
        };
    }

    public void Tick()
    {
        _tick += 3;
        if (_tick > 100) _tick = 100;
        _bar.Value = _tick;
    }

    public bool Done { get { return _tick >= 100; } }
}

// =====================================================================
// STATUS CARD
// =====================================================================

internal sealed class StatusCard : Panel
{
    private readonly Panel _dot;
    private readonly Label _lStatus;
    private readonly Label _lDetail;

    public StatusCard(string title)
    {
        Size      = new Size(258, 90);
        BackColor = Th.BgCard;

        _dot = new Panel { Size = new Size(13, 13), Location = new Point(12, 12), BackColor = Th.Pending };
        _dot.Paint += (s, e) =>
        {
            e.Graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
            using (var br = new SolidBrush(_dot.BackColor))
                e.Graphics.FillEllipse(br, 0, 0, _dot.Width, _dot.Height);
        };

        var lTitle = Th.Lbl(title, Th.FH3, Th.TextPri);
        lTitle.Location = new Point(33, 7);

        _lStatus = Th.Lbl("Verificando...", Th.FSmall, Th.Pending);
        _lStatus.Location = new Point(12, 36);

        _lDetail = new Label
        {
            Text      = "",
            Font      = Th.FSmall,
            ForeColor = Th.TextSec,
            Location  = new Point(12, 58),
            Size      = new Size(234, 26),
            AutoSize  = false
        };

        Controls.AddRange(new Control[] { _dot, lTitle, _lStatus, _lDetail });
        Paint += (s, e) => { using (var p = new Pen(Th.Border)) e.Graphics.DrawRectangle(p, 0, 0, Width - 1, Height - 1); };
    }

    public void SetOk(bool ok, string detail)
    {
        _dot.BackColor  = ok ? Th.Ok : Th.Fail;
        _lStatus.Text   = ok ? "CONECTADO" : "FALLA";
        _lStatus.ForeColor = ok ? Th.Ok : Th.Fail;
        var d = detail != null ? detail : "";
        _lDetail.Text   = d.Length > 52 ? d.Substring(0, 49) + "..." : d;
        _dot.Invalidate();
    }

    public void SetPending()
    {
        _dot.BackColor  = Th.Pending;
        _lStatus.Text   = "Verificando...";
        _lStatus.ForeColor = Th.Pending;
        _lDetail.Text   = "";
        _dot.Invalidate();
    }
}

// =====================================================================
// BRAIN HEALTH FORM
// =====================================================================

internal sealed class BrainHealthForm : Form
{
    private readonly MonitorConfig _cfg;
    private readonly List<RowResult> _rows = new List<RowResult>();
    private readonly Label _lblGlobal;
    private readonly Label _lblTime;
    private readonly RichTextBox _rtbResponse;
    private readonly Button _btnRefresh;

    public BrainHealthForm(MonitorConfig cfg)
    {
        _cfg = cfg;
        Text             = "Estado del Cerebro GGUF \u2014 EliosMind 2B";
        Size             = new Size(700, 570);
        MinimumSize      = new Size(700, 570);
        StartPosition    = FormStartPosition.CenterParent;
        BackColor        = Th.BgMain;
        FormBorderStyle  = FormBorderStyle.FixedDialog;
        MaximizeBox      = false;

        // Header
        var hdr = new Panel { BackColor = Th.BgHeader, Dock = DockStyle.Top, Height = 62 };
        var hTitle = Th.Lbl("Estado del Cerebro GGUF", Th.FH2, Th.Accent); hTitle.Location = new Point(16, 8);
        var hSub   = Th.Lbl("Modelo: " + cfg.Model + "   |   Proxy: " + cfg.ProxyBaseUrl, Th.FSmall, Th.TextSec);
        hSub.Location = new Point(16, 36);
        hdr.Controls.AddRange(new Control[] { hTitle, hSub });

        _lblGlobal = new Label { Text = "\u25cf Verificando...", Font = Th.FH3, ForeColor = Th.Pending, Location = new Point(16, 76), AutoSize = true };
        _lblTime   = new Label { Text = "", Font = Th.FSmall, ForeColor = Th.TextSec, Location = new Point(16, 100), AutoSize = true };

        // Check rows
        var checksPanel = new Panel { Location = new Point(12, 120), Size = new Size(660, 200), BackColor = Th.BgMain };
        var checkNames = new string[] { "Cerebro GGUF /health", "API key/token + generate", "Aplicacion conectada al cerebro" };
        for (var i = 0; i < checkNames.Length; i++)
        {
            var row = BuildRow(checkNames[i]);
            row.Panel.Location = new Point(0, i * 64);
            checksPanel.Controls.Add(row.Panel);
            _rows.Add(row);
        }

        var lblRsp = Th.Lbl("Ultima respuesta del modelo:", Th.FH3, Th.TextSec); lblRsp.Location = new Point(16, 332);
        _rtbResponse = new RichTextBox
        {
            Location    = new Point(16, 356),
            Size        = new Size(654, 118),
            BackColor   = Th.BgCard,
            ForeColor   = Th.TextPri,
            Font        = Th.FMono,
            ReadOnly    = true,
            BorderStyle = BorderStyle.None,
            ScrollBars  = RichTextBoxScrollBars.Vertical
        };

        _btnRefresh = Th.Btn("Verificar Ahora", Th.BtnBlue, 180, 38);
        _btnRefresh.Location = new Point(16, 492);
        _btnRefresh.Click += (s, e) => DoCheck();

        var btnClose = Th.Btn("Cerrar", Th.BgCard, 110, 38);
        btnClose.Location = new Point(204, 492);
        btnClose.Click += (s, e) => Close();

        Controls.AddRange(new Control[] { hdr, _lblGlobal, _lblTime, checksPanel, lblRsp, _rtbResponse, _btnRefresh, btnClose });
        Shown += (s, e) => DoCheck();
    }

    private sealed class RowResult { public Panel Panel; public Panel Dot; public Label Detail; }

    private RowResult BuildRow(string name)
    {
        var p = new Panel { Size = new Size(660, 58), BackColor = Th.BgCard };
        p.Paint += (s, e) => { using (var pen = new Pen(Th.Border)) e.Graphics.DrawRectangle(pen, 0, 0, p.Width - 1, p.Height - 1); };

        var dot = new Panel { Size = new Size(13, 13), Location = new Point(12, 22), BackColor = Th.Pending };
        dot.Paint += (s, e) =>
        {
            e.Graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
            using (var br = new SolidBrush(dot.BackColor))
                e.Graphics.FillEllipse(br, 0, 0, dot.Width, dot.Height);
        };

        var lName   = Th.Lbl(name, Th.FH3, Th.TextPri); lName.Location = new Point(34, 6);
        var lDetail = new Label { Text = "Verificando...", Font = Th.FSmall, ForeColor = Th.TextSec, Location = new Point(34, 32), Size = new Size(616, 20), AutoSize = false };
        p.Controls.AddRange(new Control[] { dot, lName, lDetail });

        var cr = new RowResult(); cr.Panel = p; cr.Dot = dot; cr.Detail = lDetail;

        return cr;
    }

    private void UpdateRow(int idx, bool ok, string detail)
    {
        if (idx >= _rows.Count) return;
        _rows[idx].Dot.BackColor = ok ? Th.Ok : Th.Fail;
        _rows[idx].Detail.Text = detail;
        _rows[idx].Detail.ForeColor = ok ? Th.TextSec : Th.Fail;
        _rows[idx].Dot.Invalidate();
    }

    private void DoCheck()
    {
        _btnRefresh.Enabled = false;
        _lblGlobal.Text = "\u25cf Verificando...";
        _lblGlobal.ForeColor = Th.Pending;
        for (var i = 0; i < _rows.Count; i++) { _rows[i].Dot.BackColor = Th.Pending; _rows[i].Detail.Text = "Verificando..."; _rows[i].Dot.Invalidate(); }

        ThreadPool.QueueUserWorkItem(delegate(object state)
        {
            var results = MonitorLogic.RunChecks(_cfg);
            BeginInvoke(new Action(delegate()
            {
                var allOk = true;
                var preview = "";
                for (var i = 0; i < results.Count; i++)
                {
                    UpdateRow(i, results[i].Ok, results[i].Detail);
                    if (!results[i].Ok) allOk = false;
                    if (!string.IsNullOrEmpty(results[i].ResponsePreview)) preview = results[i].ResponsePreview;
                }
                _lblGlobal.Text      = allOk ? "\u25cf TODO CONECTADO \u2014 Sistema operativo" : "\u25cf FALLAS DETECTADAS \u2014 Revisa el detalle";
                _lblGlobal.ForeColor = allOk ? Th.Ok : Th.Fail;
                _lblTime.Text        = "Ultima verificacion: " + DateTime.Now.ToString("HH:mm:ss");
                _rtbResponse.Text    = string.IsNullOrEmpty(preview) ? "(sin respuesta)" : preview;
                _btnRefresh.Enabled  = true;
            }));
        }, null);
    }
}

// =====================================================================
// NEW API KEY DIALOG
// =====================================================================

internal sealed class NewKeyDialog : Form
{
    public string KeyName  = "";
    public string AppName  = "";

    public NewKeyDialog()
    {
        Text            = "Nueva API Key";
        Size            = new Size(390, 250);
        StartPosition   = FormStartPosition.CenterParent;
        BackColor       = Th.BgCard;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox     = false;
        MinimizeBox     = false;

        var lName = Th.Lbl("Nombre descriptivo:", Th.FBody, Th.TextPri); lName.Location = new Point(18, 18);
        var tName = Th.TxtBox(18, 40, 340);

        var lApp = Th.Lbl("App que usara esta key (opcional):", Th.FBody, Th.TextPri); lApp.Location = new Point(18, 76);
        var tApp = Th.TxtBox(18, 98, 340);

        var btnOk = Th.Btn("Generar Key", Th.BtnGreen, 130, 36); btnOk.Location = new Point(18, 152);
        btnOk.Click += (s, e) =>
        {
            if (string.IsNullOrWhiteSpace(tName.Text)) { MessageBox.Show("Ingresa un nombre.", "Aviso", MessageBoxButtons.OK, MessageBoxIcon.Warning); return; }
            KeyName = tName.Text.Trim();
            AppName = tApp.Text.Trim();
            DialogResult = DialogResult.OK;
            Close();
        };
        var btnCancel = Th.Btn("Cancelar", Color.FromArgb(40, 40, 60), 110, 36); btnCancel.Location = new Point(156, 152);
        btnCancel.Click += (s, e) => { DialogResult = DialogResult.Cancel; Close(); };

        Controls.AddRange(new Control[] { lName, tName, lApp, tApp, btnOk, btnCancel });
    }
}

// =====================================================================
// API KEYS FORM
// =====================================================================

internal sealed class ApiKeysForm : Form
{
    private readonly DataGridView _grid;
    private List<ApiKeyEntry> _keys;
    private bool _showKeys = false;

    public ApiKeysForm()
    {
        Text            = "Gestion de API Keys \u2014 EliosMind 2B";
        Size            = new Size(840, 530);
        MinimumSize     = new Size(840, 530);
        StartPosition   = FormStartPosition.CenterParent;
        BackColor       = Th.BgMain;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox     = false;

        // Header
        var hdr = new Panel { BackColor = Th.BgHeader, Dock = DockStyle.Top, Height = 58 };
        var hTitle = Th.Lbl("Gestion de API Keys", Th.FH2, Th.Accent);           hTitle.Location = new Point(16, 8);
        var hSub   = Th.Lbl("Las keys se almacenan localmente en tu equipo.", Th.FSmall, Th.TextSec); hSub.Location = new Point(16, 36);
        hdr.Controls.AddRange(new Control[] { hTitle, hSub });

        // Grid
        _grid = new DataGridView
        {
            Location                    = new Point(12, 70),
            Size                        = new Size(804, 350),
            BackgroundColor             = Th.BgCard,
            ForeColor                   = Th.TextPri,
            GridColor                   = Th.Border,
            BorderStyle                 = BorderStyle.None,
            RowHeadersVisible           = false,
            AutoSizeColumnsMode         = DataGridViewAutoSizeColumnsMode.Fill,
            SelectionMode               = DataGridViewSelectionMode.FullRowSelect,
            MultiSelect                 = false,
            ReadOnly                    = true,
            AllowUserToAddRows          = false,
            ColumnHeadersDefaultCellStyle = new DataGridViewCellStyle { BackColor = Th.BgHeader, ForeColor = Th.TextPri, Font = Th.FSmall },
            DefaultCellStyle            = new DataGridViewCellStyle { BackColor = Th.BgCard, ForeColor = Th.TextPri, Font = Th.FSmall, SelectionBackColor = Th.Accent, SelectionForeColor = Color.White },
            AlternatingRowsDefaultCellStyle = new DataGridViewCellStyle { BackColor = Color.FromArgb(28, 42, 75), ForeColor = Th.TextPri }
        };
        _grid.Columns.Add(new DataGridViewTextBoxColumn { Name = "cName",    HeaderText = "Nombre",       FillWeight = 20 });
        _grid.Columns.Add(new DataGridViewTextBoxColumn { Name = "cKey",     HeaderText = "API Key",      FillWeight = 38 });
        _grid.Columns.Add(new DataGridViewTextBoxColumn { Name = "cApp",     HeaderText = "App Asignada", FillWeight = 22 });
        _grid.Columns.Add(new DataGridViewTextBoxColumn { Name = "cCreated", HeaderText = "Creada",       FillWeight = 14 });
        _grid.Columns.Add(new DataGridViewTextBoxColumn { Name = "cId",      HeaderText = "ID",           FillWeight = 8, Visible = false });

        // Buttons
        var btnNew    = Th.Btn("+ Nueva API Key",   Th.BtnGreen,  148, 36); btnNew.Location    = new Point(12,  434);
        var btnCopy   = Th.Btn("\ud83d\udccb Copiar Clave",    Th.BtnBlue,   138, 36); btnCopy.Location   = new Point(168, 434);
        var btnToggle = Th.Btn("\ud83d\udc41 Mostrar/Ocultar", Th.BgCard,    160, 36); btnToggle.Location = new Point(314, 434);
        var btnDel    = Th.Btn("\ud83d\uddd1 Eliminar",        Th.BtnRed,    118, 36); btnDel.Location    = new Point(482, 434);
        var btnClose  = Th.Btn("Cerrar",            Th.BgCard,    100, 36); btnClose.Location  = new Point(730, 434);

        btnNew.Click    += OnNew;
        btnCopy.Click   += OnCopy;
        btnToggle.Click += (s, e) => { _showKeys = !_showKeys; RefreshGrid(); };
        btnDel.Click    += OnDelete;
        btnClose.Click  += (s, e) => Close();

        Controls.AddRange(new Control[] { hdr, _grid, btnNew, btnCopy, btnToggle, btnDel, btnClose });
        _keys = ApiKeyStore.Load();
        RefreshGrid();
    }

    private void RefreshGrid()
    {
        _grid.Rows.Clear();
        foreach (var k in _keys)
            _grid.Rows.Add(k.Name, _showKeys ? k.Key : MaskKey(k.Key), k.AppName, k.CreatedAt, k.Id);
    }

    private static string MaskKey(string key)
    {
        if (string.IsNullOrEmpty(key)) return "";
        var idx = key.IndexOf('-');
        var prefix = idx >= 0 ? key.Substring(0, idx + 1) : key.Substring(0, Math.Min(5, key.Length));
        return prefix + new string('\u25cf', 30);
    }

    private void OnNew(object sender, EventArgs e)
    {
        var dlg = new NewKeyDialog();
        if (dlg.ShowDialog(this) != DialogResult.OK) return;
        var entry = new ApiKeyEntry
        {
            Id        = Guid.NewGuid().ToString("N").Substring(0, 8),
            Name      = dlg.KeyName,
            Key       = ApiKeyStore.GenerateKey(),
            AppName   = dlg.AppName,
            CreatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
            LastUsed  = ""
        };
        _keys.Add(entry);
        ApiKeyStore.Save(_keys);
        RefreshGrid();
        if (_grid.Rows.Count > 0) { _grid.ClearSelection(); _grid.Rows[_grid.Rows.Count - 1].Selected = true; }
        MessageBox.Show("API Key generada:\n\n" + entry.Key + "\n\n\u26a0 Guarda esta clave ahora antes de cerrar.\nSelecciona la fila y usa 'Copiar Clave' para copiarla.",
            "Nueva API Key creada", MessageBoxButtons.OK, MessageBoxIcon.Information);
    }

    private void OnCopy(object sender, EventArgs e)
    {
        if (_grid.SelectedRows.Count == 0) { MessageBox.Show("Selecciona una fila primero.", "Aviso", MessageBoxButtons.OK, MessageBoxIcon.Warning); return; }
        object idObj = _grid.SelectedRows[0].Cells["cId"].Value;
        var id = idObj != null ? idObj.ToString() : "";
        var entry = _keys.Find(delegate(ApiKeyEntry k) { return k.Id == id; });
        if (entry != null)
        {
            Clipboard.SetText(entry.Key);
            MessageBox.Show("Clave copiada al portapapeles.", "Copiado", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
    }

    private void OnDelete(object sender, EventArgs e)
    {
        if (_grid.SelectedRows.Count == 0) { MessageBox.Show("Selecciona una fila primero.", "Aviso", MessageBoxButtons.OK, MessageBoxIcon.Warning); return; }
        object idObj = _grid.SelectedRows[0].Cells["cId"].Value;
        var id = idObj != null ? idObj.ToString() : "";
        var entry = _keys.Find(delegate(ApiKeyEntry k) { return k.Id == id; });
        if (entry == null) return;
        if (MessageBox.Show("Eliminar la API Key \"" + entry.Name + "\"?", "Confirmar", MessageBoxButtons.YesNo, MessageBoxIcon.Question) != DialogResult.Yes) return;
        _keys.Remove(entry);
        ApiKeyStore.Save(_keys);
        RefreshGrid();
    }
}

// =====================================================================
// ADD APP DIALOG
// =====================================================================

internal sealed class AddAppDialog : Form
{
    public string AppName       = "";
    public string AppUrl        = "";
    public string SelectedApiKey = "";

    public AddAppDialog(List<ApiKeyEntry> apiKeys)
    {
        Text            = "Agregar App Conectada";
        Size            = new Size(430, 300);
        StartPosition   = FormStartPosition.CenterParent;
        BackColor       = Th.BgCard;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox     = false;
        MinimizeBox     = false;

        var lName = Th.Lbl("Nombre de la app:", Th.FBody, Th.TextPri); lName.Location = new Point(18, 16);
        var tName = Th.TxtBox(18, 38, 382);

        var lUrl = Th.Lbl("URL / Endpoint (ej: http://127.0.0.1:3000/api/chat):", Th.FBody, Th.TextPri); lUrl.Location = new Point(18, 74);
        var tUrl = Th.TxtBox(18, 96, 382);

        var lKey = Th.Lbl("API Key asignada:", Th.FBody, Th.TextPri); lKey.Location = new Point(18, 132);
        var cbo = new ComboBox { Location = new Point(18, 154), Size = new Size(382, 26), BackColor = Th.BgInput, ForeColor = Th.TextPri, Font = Th.FBody, DropDownStyle = ComboBoxStyle.DropDownList, FlatStyle = FlatStyle.Flat };
        cbo.Items.Add("(sin asignar)");
        var keyValues = new List<string>(); keyValues.Add("");
        foreach (var k in apiKeys) { cbo.Items.Add(k.Name + "  \u2014  " + MaskKey(k.Key)); keyValues.Add(k.Key); }
        cbo.SelectedIndex = 0;

        var btnOk = Th.Btn("Agregar", Th.BtnGreen, 110, 36); btnOk.Location = new Point(18, 218);
        btnOk.Click += (s, e) =>
        {
            if (string.IsNullOrWhiteSpace(tName.Text)) { MessageBox.Show("Ingresa un nombre.", "Aviso", MessageBoxButtons.OK, MessageBoxIcon.Warning); return; }
            if (string.IsNullOrWhiteSpace(tUrl.Text))  { MessageBox.Show("Ingresa la URL.",    "Aviso", MessageBoxButtons.OK, MessageBoxIcon.Warning); return; }
            AppName        = tName.Text.Trim();
            AppUrl         = tUrl.Text.Trim();
            var idx = cbo.SelectedIndex;
            SelectedApiKey = (idx >= 0 && idx < keyValues.Count) ? keyValues[idx] : "";
            DialogResult = DialogResult.OK;
            Close();
        };
        var btnCancel = Th.Btn("Cancelar", Color.FromArgb(40, 40, 60), 110, 36); btnCancel.Location = new Point(136, 218);
        btnCancel.Click += (s, e) => { DialogResult = DialogResult.Cancel; Close(); };

        Controls.AddRange(new Control[] { lName, tName, lUrl, tUrl, lKey, cbo, btnOk, btnCancel });
    }

    private static string MaskKey(string key)
    {
        if (string.IsNullOrEmpty(key) || key.Length <= 12) return key;
        return key.Substring(0, 12) + "...";
    }
}

// =====================================================================
// CONNECTED APPS FORM
// =====================================================================

internal sealed class ConnectedAppsForm : Form
{
    private readonly DataGridView _grid;
    private List<ConnectedApp> _apps;

    public ConnectedAppsForm()
    {
        Text            = "Apps Conectadas \u2014 EliosMind 2B";
        Size            = new Size(860, 530);
        MinimumSize     = new Size(860, 530);
        StartPosition   = FormStartPosition.CenterParent;
        BackColor       = Th.BgMain;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox     = false;

        var hdr = new Panel { BackColor = Th.BgHeader, Dock = DockStyle.Top, Height = 58 };
        var hTitle = Th.Lbl("Apps Conectadas", Th.FH2, Th.Accent); hTitle.Location = new Point(16, 8);
        var hSub   = Th.Lbl("Gestiona las aplicaciones que consumen el cerebro GGUF.", Th.FSmall, Th.TextSec); hSub.Location = new Point(16, 36);
        hdr.Controls.AddRange(new Control[] { hTitle, hSub });

        _grid = new DataGridView
        {
            Location              = new Point(12, 70),
            Size                  = new Size(826, 350),
            BackgroundColor       = Th.BgCard,
            ForeColor             = Th.TextPri,
            GridColor             = Th.Border,
            BorderStyle           = BorderStyle.None,
            RowHeadersVisible     = false,
            AutoSizeColumnsMode   = DataGridViewAutoSizeColumnsMode.Fill,
            SelectionMode         = DataGridViewSelectionMode.FullRowSelect,
            MultiSelect           = false,
            ReadOnly              = true,
            AllowUserToAddRows    = false,
            ColumnHeadersDefaultCellStyle = new DataGridViewCellStyle { BackColor = Th.BgHeader, ForeColor = Th.TextPri, Font = Th.FSmall },
            DefaultCellStyle      = new DataGridViewCellStyle { BackColor = Th.BgCard, ForeColor = Th.TextPri, Font = Th.FSmall, SelectionBackColor = Th.Accent, SelectionForeColor = Color.White }
        };
        _grid.Columns.Add(new DataGridViewTextBoxColumn { Name = "cName",   HeaderText = "App",              FillWeight = 18 });
        _grid.Columns.Add(new DataGridViewTextBoxColumn { Name = "cUrl",    HeaderText = "URL / Endpoint",   FillWeight = 32 });
        _grid.Columns.Add(new DataGridViewTextBoxColumn { Name = "cKey",    HeaderText = "API Key Asignada", FillWeight = 28 });
        _grid.Columns.Add(new DataGridViewTextBoxColumn { Name = "cStatus", HeaderText = "Estado",           FillWeight = 12 });
        _grid.Columns.Add(new DataGridViewTextBoxColumn { Name = "cAdded",  HeaderText = "Anadida",          FillWeight = 14 });

        var btnAdd   = Th.Btn("+ Agregar App",      Th.BtnGreen,  142, 36); btnAdd.Location   = new Point(12,  434);
        var btnTest  = Th.Btn("\u26a1 Probar Conexion", Th.BtnBlue, 155, 36); btnTest.Location  = new Point(162, 434);
        var btnDel   = Th.Btn("\ud83d\uddd1 Eliminar",  Th.BtnRed,  120, 36); btnDel.Location   = new Point(325, 434);
        var btnClose = Th.Btn("Cerrar",             Th.BgCard,    100, 36); btnClose.Location = new Point(752, 434);

        btnAdd.Click   += OnAdd;
        btnTest.Click  += OnTest;
        btnDel.Click   += OnDelete;
        btnClose.Click += (s, e) => Close();

        Controls.AddRange(new Control[] { hdr, _grid, btnAdd, btnTest, btnDel, btnClose });
        _apps = AppStore.Load();
        RefreshGrid();
    }

    private void RefreshGrid()
    {
        _grid.Rows.Clear();
        foreach (var app in _apps)
        {
            var kd = string.IsNullOrEmpty(app.ApiKey) ? "(sin asignar)" : (app.ApiKey.Length > 22 ? app.ApiKey.Substring(0, 22) + "..." : app.ApiKey);
            _grid.Rows.Add(app.Name, app.Url, kd, "\u2014", app.AddedAt);
        }
    }

    private void OnAdd(object sender, EventArgs e)
    {
        var dlg = new AddAppDialog(ApiKeyStore.Load());
        if (dlg.ShowDialog(this) != DialogResult.OK) return;
        _apps.Add(new ConnectedApp { Name = dlg.AppName, Url = dlg.AppUrl, ApiKey = dlg.SelectedApiKey, AddedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm") });
        AppStore.Save(_apps);
        RefreshGrid();
    }

    private void OnTest(object sender, EventArgs e)
    {
        if (_grid.SelectedRows.Count == 0) { MessageBox.Show("Selecciona una app primero.", "Aviso", MessageBoxButtons.OK, MessageBoxIcon.Warning); return; }
        var rowIdx = _grid.SelectedRows[0].Index;
        if (rowIdx >= _apps.Count) return;
        var appUrl = _apps[rowIdx].Url;
        if (string.IsNullOrWhiteSpace(appUrl)) { MessageBox.Show("La app no tiene URL configurada.", "Aviso", MessageBoxButtons.OK, MessageBoxIcon.Warning); return; }
        _grid.Rows[rowIdx].Cells["cStatus"].Value = "Probando...";

        var capturedIdx = rowIdx;
        ThreadPool.QueueUserWorkItem(delegate(object state)
        {
            bool ok = false; string detail = "";
            try
            {
                using (var client = new HttpClient())
                {
                    client.Timeout = TimeSpan.FromSeconds(10);
                    var res = client.GetAsync(appUrl).GetAwaiter().GetResult();
                    ok = (int)res.StatusCode < 500;
                    detail = "HTTP " + (int)res.StatusCode;
                }
            }
            catch (Exception ex) { detail = ex.Message.Length > 40 ? ex.Message.Substring(0, 40) + "..." : ex.Message; }
            BeginInvoke(new Action(delegate()
            {
                if (capturedIdx < _grid.Rows.Count)
                {
                    _grid.Rows[capturedIdx].Cells["cStatus"].Value = ok ? "\u2713 OK" : "\u2717 FAIL";
                    _grid.Rows[capturedIdx].DefaultCellStyle.ForeColor = ok ? Th.Ok : Th.Fail;
                }
                MessageBox.Show((ok ? "Conectado" : "Sin respuesta") + "\n" + detail, "Prueba de Conexion", MessageBoxButtons.OK, ok ? MessageBoxIcon.Information : MessageBoxIcon.Warning);
            }));
        }, null);
    }

    private void OnDelete(object sender, EventArgs e)
    {
        if (_grid.SelectedRows.Count == 0) { MessageBox.Show("Selecciona una app primero.", "Aviso", MessageBoxButtons.OK, MessageBoxIcon.Warning); return; }
        var rowIdx = _grid.SelectedRows[0].Index;
        if (rowIdx >= _apps.Count) return;
        if (MessageBox.Show("Eliminar la app \"" + _apps[rowIdx].Name + "\"?", "Confirmar", MessageBoxButtons.YesNo, MessageBoxIcon.Question) != DialogResult.Yes) return;
        _apps.RemoveAt(rowIdx);
        AppStore.Save(_apps);
        RefreshGrid();
    }
}

// =====================================================================
// MAIN FORM
// =====================================================================

internal sealed class MainForm : Form
{
    private readonly MonitorConfig _cfg;
    private readonly string _logPath;
    private readonly System.Windows.Forms.Timer _timer;
    private readonly StatusCard _cardProxy, _cardApiKey, _cardApp;
    private readonly Label _lblGlobal;
    private readonly Label _lblTime;
    private readonly Label _lblNext;
    private readonly RichTextBox _rtbLog;
    private int _countdown;

    public MainForm(MonitorConfig cfg, string logPath)
    {
        _cfg     = cfg;
        _logPath = logPath;

        Text            = "EliosMind 2B \u2014 Panel de Control";
        Size            = new Size(890, 530);
        MinimumSize     = new Size(890, 530);
        StartPosition   = FormStartPosition.CenterScreen;
        BackColor       = Th.BgMain;
        FormBorderStyle = FormBorderStyle.FixedSingle;
        MaximizeBox     = false;

        // ---- Header ----
        var hdr = new Panel { BackColor = Th.BgHeader, Dock = DockStyle.Top, Height = 68 };
        var hTitle = new Label { Text = "\u26a1 EliosMind 2B", Font = Th.FH2, ForeColor = Th.Accent, Location = new Point(16, 8), AutoSize = true };
        var hSub   = Th.Lbl("Panel de Control  \u2014  Cerebro Unico Corvinus", Th.FSmall, Th.TextSec); hSub.Location = new Point(18, 38);
        var hModel = Th.Lbl("Modelo: " + cfg.Model + "   |   Proxy: " + cfg.ProxyBaseUrl, Th.FSmall, Th.TextSec); hModel.Location = new Point(18, 52);
        hdr.Controls.AddRange(new Control[] { hTitle, hSub, hModel });

        // ---- Status cards ----
        var cardsPanel = new Panel { Location = new Point(12, 82), Size = new Size(856, 100), BackColor = Th.BgMain };
        _cardProxy  = new StatusCard("Cerebro GGUF /health"); _cardProxy.Location  = new Point(0,   0);
        _cardApiKey = new StatusCard("API Key / Token");       _cardApiKey.Location = new Point(278, 0);
        _cardApp    = new StatusCard("App IA Juris");          _cardApp.Location    = new Point(556, 0);
        cardsPanel.Controls.AddRange(new Control[] { _cardProxy, _cardApiKey, _cardApp });

        // ---- Global status & timestamps ----
        _lblGlobal = new Label { Text = "\u25cf Iniciando...", Font = Th.FH3, ForeColor = Th.Pending, Location = new Point(16, 194), AutoSize = true };
        _lblTime   = Th.Lbl("Ultima verificacion: \u2014", Th.FSmall, Th.TextSec); _lblTime.Location = new Point(16, 220);
        _lblNext   = Th.Lbl("", Th.FSmall, Th.TextSec); _lblNext.Location = new Point(290, 220);

        // ---- Action buttons ----
        var btnHealth  = Th.Btn("\ud83e\udde0 Estado Cerebro",   Th.BtnBlue,   155, 40); btnHealth.Location  = new Point(12,  252);
        var btnKeys    = Th.Btn("\ud83d\udd11 Gestionar API Keys", Th.BtnGreen,  168, 40); btnKeys.Location    = new Point(175, 252);
        var btnApps    = Th.Btn("\ud83d\udcf1 Apps Conectadas",  Th.BtnPurple, 158, 40); btnApps.Location    = new Point(351, 252);
        var btnRefresh = Th.Btn("\u21bb Actualizar Ya",           Th.BgCard,    148, 40); btnRefresh.Location = new Point(517, 252);

        btnHealth.Click  += (s, e) => new BrainHealthForm(_cfg).ShowDialog(this);
        btnKeys.Click    += (s, e) => new ApiKeysForm().ShowDialog(this);
        btnApps.Click    += (s, e) => new ConnectedAppsForm().ShowDialog(this);
        btnRefresh.Click += (s, e) => { _countdown = _cfg.IntervalSeconds; RunAndUpdate(); };

        // ---- Log panel ----
        var logPnl = new Panel { Location = new Point(12, 308), Size = new Size(856, 108), BackColor = Th.BgCard };
        logPnl.Paint += (s, e) => { using (var p = new Pen(Th.Border)) e.Graphics.DrawRectangle(p, 0, 0, logPnl.Width - 1, logPnl.Height - 1); };
        var logLbl = Th.Lbl("Registro reciente:", Th.FSmall, Th.TextSec); logLbl.Location = new Point(8, 6);
        _rtbLog = new RichTextBox { Location = new Point(8, 24), Size = new Size(838, 76), BackColor = Th.BgCard, ForeColor = Th.TextSec, Font = Th.FMono, ReadOnly = true, BorderStyle = BorderStyle.None, ScrollBars = RichTextBoxScrollBars.Vertical };
        logPnl.Controls.AddRange(new Control[] { logLbl, _rtbLog });

        // ---- Status bar ----
        var sbar = new Panel { Dock = DockStyle.Bottom, Height = 26, BackColor = Th.BgHeader };
        var sbarLbl = new Label { Text = "  EliosMind 2B v1.1.0  |  " + cfg.ProxyBaseUrl + "  |  " + cfg.AppChatUrl, Font = Th.FSmall, ForeColor = Th.TextSec, Dock = DockStyle.Fill, TextAlign = ContentAlignment.MiddleLeft };
        sbar.Controls.Add(sbarLbl);

        Controls.AddRange(new Control[] { hdr, cardsPanel, _lblGlobal, _lblTime, _lblNext, btnHealth, btnKeys, btnApps, btnRefresh, logPnl, sbar });

        // ---- Stack startup ----
        var startScript = Path.Combine(cfg.ProjectRoot, cfg.StartScriptRelativePath);
        if (cfg.AutoStartStack) MonitorLogic.LaunchStack(startScript);
        if (cfg.AutoStartAppDev) ThreadPool.QueueUserWorkItem(delegate(object s) { MonitorLogic.EnsureAppDev(cfg); }, null);

        // ---- Timer ----
        _countdown = cfg.IntervalSeconds;
        _timer     = new System.Windows.Forms.Timer { Interval = 1000 };
        _timer.Tick += OnTick;
        _timer.Start();
        ThreadPool.QueueUserWorkItem(delegate(object s) { Thread.Sleep(2200); RunAndUpdate(); }, null);
    }

    private void OnTick(object sender, EventArgs e)
    {
        _countdown--;
        _lblNext.Text = "Proxima verificacion en " + _countdown + "s";
        if (_countdown <= 0) { _countdown = _cfg.IntervalSeconds; RunAndUpdate(); }
    }

    private void RunAndUpdate()
    {
        ThreadPool.QueueUserWorkItem(delegate(object s)
        {
            var results = MonitorLogic.RunChecks(_cfg);
            var allOk   = true;
            foreach (var r in results) if (!r.Ok) { allOk = false; break; }
            var ts = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            MonitorLogic.AppendLog(_logPath, ts, results, allOk);

            BeginInvoke(new Action(delegate()
            {
                if (results.Count >= 1) _cardProxy.SetOk(results[0].Ok,  results[0].Detail);
                if (results.Count >= 2) _cardApiKey.SetOk(results[1].Ok, results[1].Detail);
                if (results.Count >= 3) _cardApp.SetOk(results[2].Ok,    results[2].Detail);

                _lblGlobal.Text      = allOk ? "\u25cf TODO CONECTADO \u2014 Sistema operativo" : "\u25cf FALLAS DETECTADAS \u2014 Revisa el detalle";
                _lblGlobal.ForeColor = allOk ? Th.Ok : Th.Fail;
                _lblTime.Text        = "Ultima verificacion: " + DateTime.Now.ToString("HH:mm:ss");

                var sb = new StringBuilder();
                foreach (var r in results)
                    sb.AppendLine((r.Ok ? "[OK]   " : "[FAIL] ") + r.Name + " \u2014 " + r.Detail);
                _rtbLog.Text = sb.ToString().TrimEnd();
            }));
        }, null);
    }

    protected override void OnFormClosed(FormClosedEventArgs e)
    {
        _timer.Stop();
        _timer.Dispose();
        base.OnFormClosed(e);
    }
}

// =====================================================================
// ENTRY POINT
// =====================================================================

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072;
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);

        var exeDir     = AppDomain.CurrentDomain.BaseDirectory;
        var configPath = Path.Combine(exeDir, "proyecto eliosmind2b.config.json");
        var logPath    = Path.Combine(exeDir, "proyecto eliosmind2b.monitor.log");
        var config     = MonitorLogic.LoadConfig(configPath);

        // Splash
        var splash = new SplashForm();
        splash.Show();
        splash.Refresh();
        var deadline = DateTime.Now.AddMilliseconds(5000);
        while (DateTime.Now < deadline)
        {
            splash.Tick();
            Application.DoEvents();
            Thread.Sleep(26);
        }
        splash.Hide();

        Application.Run(new MainForm(config, logPath));
    }
}
