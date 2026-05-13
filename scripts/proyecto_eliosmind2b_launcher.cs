using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;

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

    public CheckResult(string name, bool ok, string detail)
    {
        Name = name;
        Ok = ok;
        Detail = detail;
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

internal static class Program
{
    private static readonly JavaScriptSerializer Json = new JavaScriptSerializer();

    private static int Main()
    {
        ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072;

        var exeDir = AppDomain.CurrentDomain.BaseDirectory;
        var configPath = Path.Combine(exeDir, "proyecto eliosmind2b.config.json");
        var logPath = Path.Combine(exeDir, "proyecto eliosmind2b.monitor.log");

        var config = LoadConfig(configPath);
        var startScript = Path.Combine(config.ProjectRoot, config.StartScriptRelativePath);

        PrintHeader(config, configPath, startScript);

        if (config.AutoStartStack)
        {
            var launchOk = LaunchStack(startScript);
            WriteLine(launchOk ? "[OK] Lanzador del stack ejecutado." : "[WARN] No se pudo lanzar el stack.", launchOk ? ConsoleColor.Green : ConsoleColor.Yellow);
        }

        if (config.AutoStartAppDev)
        {
            var appLaunchOk = EnsureAppDev(config);
            WriteLine(appLaunchOk ? "[OK] App local verificada/iniciada." : "[WARN] No se pudo verificar o iniciar la app local.", appLaunchOk ? ConsoleColor.Green : ConsoleColor.Yellow);
        }

        while (true)
        {
            var timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            var checks = RunChecks(config).GetAwaiter().GetResult();

            var allOk = true;
            foreach (var check in checks)
            {
                if (!check.Ok)
                {
                    allOk = false;
                    break;
                }
            }

            WriteLine("", ConsoleColor.Gray);
            WriteLine("==============================================", ConsoleColor.DarkGray);
            WriteLine("[" + timestamp + "] Estado integral proyecto eliosmind2b", ConsoleColor.Cyan);

            foreach (var check in checks)
            {
                var color = check.Ok ? ConsoleColor.Green : ConsoleColor.Red;
                var state = check.Ok ? "OK" : "FAIL";
                WriteLine("[" + state + "] " + check.Name + " -> " + check.Detail, color);
            }

            WriteLine(allOk ? "[GLOBAL] Todo conectado: app + cerebro GGUF + API key/token." : "[GLOBAL] Hay fallas de conexion o API key/token.", allOk ? ConsoleColor.Green : ConsoleColor.Yellow);
            AppendLog(logPath, timestamp, checks, allOk);

            Thread.Sleep(Math.Max(10, config.IntervalSeconds) * 1000);
        }
    }

    private static MonitorConfig LoadConfig(string configPath)
    {
        var config = new MonitorConfig();

        if (!File.Exists(configPath))
        {
            return config;
        }

        try
        {
            var content = File.ReadAllText(configPath, Encoding.UTF8);
            var map = Json.Deserialize<Dictionary<string, object>>(content);
            if (map == null)
            {
                return config;
            }

            ApplyString(map, "ProjectRoot", value => config.ProjectRoot = value);
            ApplyString(map, "StartScriptRelativePath", value => config.StartScriptRelativePath = value);
            ApplyString(map, "ProxyBaseUrl", value => config.ProxyBaseUrl = value.TrimEnd('/'));
            ApplyString(map, "ProxyToken", value => config.ProxyToken = value);
            ApplyString(map, "Model", value => config.Model = value);
            ApplyString(map, "AppChatUrl", value => config.AppChatUrl = value);
            ApplyInt(map, "IntervalSeconds", value => config.IntervalSeconds = value);
            ApplyInt(map, "RequestTimeoutSeconds", value => config.RequestTimeoutSeconds = value);
            ApplyBool(map, "AutoStartStack", value => config.AutoStartStack = value);
            ApplyBool(map, "AutoStartAppDev", value => config.AutoStartAppDev = value);
            ApplyInt(map, "AppDevPort", value => config.AppDevPort = value);
        }
        catch
        {
            WriteLine("[WARN] Config invalida; se usaran valores por defecto.", ConsoleColor.Yellow);
        }

        return config;
    }

    private static void ApplyString(Dictionary<string, object> map, string key, Action<string> assign)
    {
        object value;
        if (!map.TryGetValue(key, out value) || value == null)
        {
            return;
        }

        var text = Convert.ToString(value);
        if (!string.IsNullOrWhiteSpace(text))
        {
            assign(text);
        }
    }

    private static void ApplyInt(Dictionary<string, object> map, string key, Action<int> assign)
    {
        object value;
        if (!map.TryGetValue(key, out value) || value == null)
        {
            return;
        }

        int parsed;
        if (int.TryParse(Convert.ToString(value), out parsed) && parsed > 0)
        {
            assign(parsed);
        }
    }

    private static void ApplyBool(Dictionary<string, object> map, string key, Action<bool> assign)
    {
        object value;
        if (!map.TryGetValue(key, out value) || value == null)
        {
            return;
        }

        bool parsed;
        if (bool.TryParse(Convert.ToString(value), out parsed))
        {
            assign(parsed);
        }
    }

    private static bool LaunchStack(string startScript)
    {
        try
        {
            if (!File.Exists(startScript))
            {
                return false;
            }

            var psi = new ProcessStartInfo();
            psi.FileName = "powershell.exe";
            psi.Arguments = "-NoProfile -ExecutionPolicy Bypass -File \"" + startScript + "\"";
            psi.CreateNoWindow = true;
            psi.UseShellExecute = false;

            Process.Start(psi);
            return true;
        }
        catch
        {
            return false;
        }
    }

    private static bool EnsureAppDev(MonitorConfig config)
    {
        try
        {
            if (IsAppChatReady(config))
            {
                return true;
            }

            if (IsTcpPortOpen("127.0.0.1", config.AppDevPort, 800) && WaitForAppChatReady(config, 15))
            {
                return true;
            }

            // Si el puerto existe pero la app no esta saludable, reinicia el proceso ocupando ese puerto.
            if (IsTcpPortOpen("127.0.0.1", config.AppDevPort, 800))
            {
                TryStopProcessOnPort(config.AppDevPort);
                Thread.Sleep(1200);
            }

            var psi = new ProcessStartInfo();
            psi.FileName = "powershell.exe";
            psi.WorkingDirectory = config.ProjectRoot;
            psi.Arguments = "-NoProfile -ExecutionPolicy Bypass -Command \"$env:INTERNAL_AI_API_URL='" + config.ProxyBaseUrl.TrimEnd('/') + "/api/generate'; $env:INTERNAL_AI_AUTH_HEADER='Authorization'; $env:INTERNAL_AI_AUTH_SCHEME='Bearer'; $env:INTERNAL_AI_API_KEY='" + EscapePs(config.ProxyToken) + "'; $env:INTERNAL_AI_TIMEOUT_MS='60000'; $env:INTERNAL_AI_DEFAULT_MODEL='" + EscapePs(config.Model) + "'; npx --yes vercel dev --listen " + config.AppDevPort + "\"";
            psi.CreateNoWindow = true;
            psi.UseShellExecute = false;

            Process.Start(psi);

            return WaitForAppChatReady(config, 25);
        }
        catch
        {
            return false;
        }
    }

    private static void TryStopProcessOnPort(int port)
    {
        try
        {
            var ps = new ProcessStartInfo();
            ps.FileName = "powershell.exe";
            ps.Arguments = "-NoProfile -ExecutionPolicy Bypass -Command \"$conn = Get-NetTCPConnection -LocalPort " + port + " -State Listen -ErrorAction SilentlyContinue; if ($conn) { $ids = @($conn | Select-Object -ExpandProperty OwningProcess -Unique); foreach ($id in $ids) { try { Stop-Process -Id $id -Force -ErrorAction SilentlyContinue } catch {} } }\"";
            ps.CreateNoWindow = true;
            ps.UseShellExecute = false;
            using (var proc = Process.Start(ps))
            {
                if (proc != null)
                {
                    proc.WaitForExit(6000);
                }
            }
        }
        catch
        {
        }
    }

    private static bool IsTcpPortOpen(string host, int port, int timeoutMs)
    {
        try
        {
            using (var client = new TcpClient())
            {
                var asyncResult = client.BeginConnect(host, port, null, null);
                var success = asyncResult.AsyncWaitHandle.WaitOne(timeoutMs);
                if (!success)
                {
                    return false;
                }

                client.EndConnect(asyncResult);
                return true;
            }
        }
        catch
        {
            return false;
        }
    }

    private static bool WaitForAppChatReady(MonitorConfig config, int seconds)
    {
        for (var i = 0; i < seconds; i += 1)
        {
            Thread.Sleep(1000);
            if (IsAppChatReady(config))
            {
                return true;
            }
        }

        return false;
    }

    private static bool IsAppChatReady(MonitorConfig config)
    {
        try
        {
            using (var client = new HttpClient())
            {
                client.Timeout = TimeSpan.FromSeconds(8);
                var payload = Json.Serialize(new Dictionary<string, object>
                {
                    { "prompt", "ping readiness" }
                });
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
        catch
        {
            return false;
        }
    }

    private static string EscapePs(string value)
    {
        return String.IsNullOrEmpty(value) ? String.Empty : value.Replace("'", "''");
    }

    private static async System.Threading.Tasks.Task<List<CheckResult>> RunChecks(MonitorConfig config)
    {
        var results = new List<CheckResult>();

        using (var client = new HttpClient())
        {
            client.Timeout = TimeSpan.FromSeconds(Math.Max(5, config.RequestTimeoutSeconds));

            var healthUrl = config.ProxyBaseUrl.TrimEnd('/') + "/health";
            var health = await SafeGet(client, healthUrl);
            var healthOk = health.Ok && health.Body.IndexOf("\"ok\":true", StringComparison.OrdinalIgnoreCase) >= 0;
            results.Add(new CheckResult(
                "Cerebro GGUF /health",
                healthOk,
                healthOk ? "Proxy y upstream responden" : health.Detail));

            if (string.IsNullOrWhiteSpace(config.ProxyToken))
            {
                results.Add(new CheckResult("API key/token proxy", false, "Token vacio en configuracion"));
            }
            else
            {
                var generatePayload = Json.Serialize(new Dictionary<string, object>
                {
                    { "model", config.Model },
                    { "prompt", "Responde SOLO MONITOR_OK" },
                    { "stream", false }
                });
                var generateUrl = config.ProxyBaseUrl.TrimEnd('/') + "/api/generate";
                var generate = await SafePost(client, generateUrl, generatePayload, config.ProxyToken);
                var authOk = generate.Ok && generate.Body.IndexOf("MONITOR_OK", StringComparison.OrdinalIgnoreCase) >= 0;
                results.Add(new CheckResult(
                    "API key/token proxy + generate",
                    authOk,
                    authOk ? "Token funcional y modelo responde" : generate.Detail));
            }

            if (string.IsNullOrWhiteSpace(config.AppChatUrl))
            {
                results.Add(new CheckResult("App /api/chat", false, "AppChatUrl vacia en configuracion"));
            }
            else
            {
                var appPayload = Json.Serialize(new Dictionary<string, object>
                {
                    { "prompt", "Confirma conectividad con una frase corta" }
                });
                var app = await SafePost(client, config.AppChatUrl, appPayload, null);
                var appOk = app.Ok && app.Body.IndexOf("response", StringComparison.OrdinalIgnoreCase) >= 0;
                results.Add(new CheckResult(
                    "Aplicacion conectada al cerebro",
                    appOk,
                    appOk ? "api/chat responde y enlaza backend" : app.Detail));
            }
        }

        return results;
    }

    private static async System.Threading.Tasks.Task<HttpResult> SafeGet(HttpClient client, string url)
    {
        try
        {
            using (var response = await client.GetAsync(url))
            {
                var body = await response.Content.ReadAsStringAsync();
                var detail = "HTTP " + (int)response.StatusCode + " " + response.ReasonPhrase;
                if (!response.IsSuccessStatusCode)
                {
                    detail = detail + " | " + TrimText(body, 220);
                }

                return new HttpResult(response.IsSuccessStatusCode, body, detail);
            }
        }
        catch (Exception ex)
        {
            return new HttpResult(false, string.Empty, ex.Message);
        }
    }

    private static async System.Threading.Tasks.Task<HttpResult> SafePost(HttpClient client, string url, string payload, string bearerToken)
    {
        try
        {
            using (var request = new HttpRequestMessage(HttpMethod.Post, url))
            {
                request.Headers.ExpectContinue = false;
                request.Content = new StringContent(payload, Encoding.UTF8, "application/json");
                if (!string.IsNullOrWhiteSpace(bearerToken))
                {
                    request.Headers.TryAddWithoutValidation("Authorization", "Bearer " + bearerToken);
                }

                using (var response = await client.SendAsync(request))
                {
                    var body = await response.Content.ReadAsStringAsync();
                    var detail = "HTTP " + (int)response.StatusCode + " " + response.ReasonPhrase;
                    if (!response.IsSuccessStatusCode)
                    {
                        detail = detail + " | " + TrimText(body, 220);
                    }

                    return new HttpResult(response.IsSuccessStatusCode, body, detail);
                }
            }
        }
        catch (Exception ex)
        {
            return new HttpResult(false, string.Empty, ex.Message);
        }
    }

    private static string TrimText(string text, int maxLength)
    {
        if (string.IsNullOrEmpty(text))
        {
            return string.Empty;
        }

        var normalized = text.Replace("\r", " ").Replace("\n", " ").Trim();
        if (normalized.Length <= maxLength)
        {
            return normalized;
        }

        return normalized.Substring(0, maxLength) + "...";
    }

    private static void AppendLog(string logPath, string timestamp, List<CheckResult> checks, bool allOk)
    {
        try
        {
            var sb = new StringBuilder();
            sb.Append('[').Append(timestamp).Append("] ").Append(allOk ? "GLOBAL=OK" : "GLOBAL=FAIL");

            foreach (var check in checks)
            {
                sb.Append(" | ");
                sb.Append(check.Name).Append('=').Append(check.Ok ? "OK" : "FAIL");
            }

            File.AppendAllText(logPath, sb.ToString() + Environment.NewLine, Encoding.UTF8);
        }
        catch
        {
        }
    }

    private static void PrintHeader(MonitorConfig config, string configPath, string startScript)
    {
        WriteLine("proyecto eliosmind2b - Launcher Monitor", ConsoleColor.White);
        WriteLine("Proyecto: " + config.ProjectRoot, ConsoleColor.Gray);
        WriteLine("Script arranque: " + startScript, ConsoleColor.Gray);
        WriteLine("Proxy: " + config.ProxyBaseUrl, ConsoleColor.Gray);
        WriteLine("App chat: " + config.AppChatUrl, ConsoleColor.Gray);
        WriteLine("Config editable: " + configPath, ConsoleColor.Gray);
    }

    private static void WriteLine(string text, ConsoleColor color)
    {
        var old = Console.ForegroundColor;
        Console.ForegroundColor = color;
        Console.WriteLine(text);
        Console.ForegroundColor = old;
    }
}
