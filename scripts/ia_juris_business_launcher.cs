using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;
using System.Windows.Forms;

internal sealed class BusinessConfig
{
    public string StripeSecretKey = "";
    public string StripeApiBase = "https://api.stripe.com/v1";
    public string KvRestApiUrl = "";
    public string KvRestApiToken = "";
    public string UsersReportUrl = "http://127.0.0.1:3000/api/auth/users-report";
    public string UsersCorrectUrl = "";
    public string UsersReportToken = "";
    public int RefreshSeconds = 120;
}

internal sealed class PaymentItem
{
    public string DateText = "";
    public string Name = "";
    public string Email = "";
    public string Plan = "";
    public string Status = "";
    public string Currency = "USD";
    public decimal Amount = 0m;
}

internal sealed class UserItem
{
    public string DateText = "";
    public string FullName = "";
    public string Email = "";
    public bool Verified = false;
}

internal sealed class FinanceSnapshot
{
    public decimal TotalRevenue = 0m;
    public int PaymentsCount = 0;
    public List<PaymentItem> Payments = new List<PaymentItem>();
    public List<UserItem> Users = new List<UserItem>();
    public string Warning = "";
}

internal static class BusinessData
{
    private static readonly JavaScriptSerializer Json = new JavaScriptSerializer { MaxJsonLength = int.MaxValue };

    public static BusinessConfig LoadConfig(string configPath)
    {
        var cfg = new BusinessConfig();
        cfg.StripeSecretKey = process.envOrEmpty("STRIPE_SECRET_KEY").Trim();
        cfg.KvRestApiUrl = process.envOrEmpty("KV_REST_API_URL").Trim();
        cfg.KvRestApiToken = process.envOrEmpty("KV_REST_API_TOKEN").Trim();
        cfg.UsersReportUrl = process.envOrEmpty("USERS_REPORT_URL").Trim();
        cfg.UsersReportToken = process.envOrEmpty("AUTH_ADMIN_REPORT_TOKEN").Trim();

        if (String.IsNullOrWhiteSpace(cfg.UsersReportUrl))
        {
            cfg.UsersReportUrl = "http://127.0.0.1:3000/api/auth/users-report";
        }

        if (!File.Exists(configPath))
        {
            SaveConfig(configPath, cfg);
            return cfg;
        }

        try
        {
            var raw = File.ReadAllText(configPath, Encoding.UTF8);
            var map = Json.Deserialize<Dictionary<string, object>>(raw);
            if (map == null) return cfg;

            cfg.StripeSecretKey = ReadString(map, "StripeSecretKey", cfg.StripeSecretKey);
            cfg.StripeApiBase = ReadString(map, "StripeApiBase", cfg.StripeApiBase);
            cfg.KvRestApiUrl = ReadString(map, "KvRestApiUrl", cfg.KvRestApiUrl);
            cfg.KvRestApiToken = ReadString(map, "KvRestApiToken", cfg.KvRestApiToken);
            cfg.UsersReportUrl = ReadString(map, "UsersReportUrl", cfg.UsersReportUrl);
            cfg.UsersCorrectUrl = ReadString(map, "UsersCorrectUrl", cfg.UsersCorrectUrl);
            cfg.UsersReportToken = ReadString(map, "UsersReportToken", cfg.UsersReportToken);
            cfg.RefreshSeconds = ReadInt(map, "RefreshSeconds", cfg.RefreshSeconds);
        }
        catch
        {
        }

        return cfg;
    }

    public static void SaveConfig(string configPath, BusinessConfig cfg)
    {
        try
        {
            var dir = Path.GetDirectoryName(configPath);
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
            var map = new Dictionary<string, object>();
            map["StripeSecretKey"] = cfg.StripeSecretKey;
            map["StripeApiBase"] = cfg.StripeApiBase;
            map["KvRestApiUrl"] = cfg.KvRestApiUrl;
            map["KvRestApiToken"] = cfg.KvRestApiToken;
            map["UsersReportUrl"] = cfg.UsersReportUrl;
            map["UsersCorrectUrl"] = cfg.UsersCorrectUrl;
            map["UsersReportToken"] = cfg.UsersReportToken;
            map["RefreshSeconds"] = cfg.RefreshSeconds;
            File.WriteAllText(configPath, Json.Serialize(map), Encoding.UTF8);
        }
        catch
        {
        }
    }

    public static FinanceSnapshot BuildSnapshot(BusinessConfig cfg)
    {
        var snap = new FinanceSnapshot();

        try
        {
            LoadStripeData(cfg, snap);
        }
        catch (Exception ex)
        {
            snap.Warning = MergeWarning(snap.Warning, "Stripe: " + ex.Message);
        }

        try
        {
            LoadUsersFromKv(cfg, snap);
        }
        catch (Exception ex)
        {
            snap.Warning = MergeWarning(snap.Warning, "Usuarios/KV: " + ex.Message);
        }

        var usersBeforePaymentsFallback = snap.Users.Count;
        MergeUsersFromPayments(snap);
        if (usersBeforePaymentsFallback == 0 && snap.Users.Count > 0)
        {
            snap.Warning = MergeWarning(snap.Warning, "Usuarios reconstruidos desde Stripe porque el reporte auth no devolvio cuentas");
        }

        return snap;
    }

    private static void MergeUsersFromPayments(FinanceSnapshot snap)
    {
        var usersByEmail = new Dictionary<string, UserItem>(StringComparer.OrdinalIgnoreCase);
        for (var i = 0; i < snap.Users.Count; i++)
        {
            var existing = snap.Users[i];
            var existingEmail = (existing.Email ?? "").Trim();
            if (String.IsNullOrWhiteSpace(existingEmail) || existingEmail == "(sin email)") continue;
            usersByEmail[existingEmail] = existing;
        }

        for (var i = 0; i < snap.Payments.Count; i++)
        {
            var payment = snap.Payments[i];
            var email = (payment.Email ?? "").Trim();
            if (String.IsNullOrWhiteSpace(email) || email == "(sin email)") continue;
            if (!IsSuccessfulPaymentStatus(payment.Status)) continue;

            UserItem user;
            if (!usersByEmail.TryGetValue(email, out user))
            {
                user = new UserItem();
                user.Email = email;
                user.FullName = String.IsNullOrWhiteSpace(payment.Name) ? "(sin nombre)" : payment.Name;
                user.Verified = true;
                user.DateText = payment.DateText;
                usersByEmail[email] = user;
                continue;
            }

            if (String.IsNullOrWhiteSpace(user.FullName) || user.FullName == "(sin nombre)")
            {
                user.FullName = String.IsNullOrWhiteSpace(payment.Name) ? "(sin nombre)" : payment.Name;
            }

            if (String.IsNullOrWhiteSpace(user.DateText) || String.CompareOrdinal(payment.DateText, user.DateText) < 0)
            {
                user.DateText = payment.DateText;
            }

            user.Verified = user.Verified || IsSuccessfulPaymentStatus(payment.Status);
        }

        var mergedUsers = new List<UserItem>(usersByEmail.Values);
        mergedUsers.Sort((a, b) => String.CompareOrdinal(b.DateText, a.DateText));
        snap.Users = mergedUsers;
    }

    private static bool IsSuccessfulPaymentStatus(string status)
    {
        return String.Equals((status ?? "").Trim(), "succeeded", StringComparison.OrdinalIgnoreCase);
    }

    private static void LoadStripeData(BusinessConfig cfg, FinanceSnapshot snap)
    {
        var key = (cfg.StripeSecretKey ?? "").Trim();
        if (String.IsNullOrWhiteSpace(key))
        {
            snap.Warning = MergeWarning(snap.Warning, "Falta StripeSecretKey en config");
            return;
        }

        var baseUrl = (cfg.StripeApiBase ?? "https://api.stripe.com/v1").Trim().TrimEnd('/');

        var customerPlan = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var subUrl = baseUrl + "/subscriptions?status=all&limit=100";
        var subJson = HttpGet(subUrl, key);
        var subMap = Json.Deserialize<Dictionary<string, object>>(subJson);
        var subData = AsList(GetVal(subMap, "data"));
        foreach (var item in subData)
        {
            var sub = AsMap(item);
            var customer = AsString(GetVal(sub, "customer"));
            var planName = ExtractSubscriptionPlan(sub);
            if (!String.IsNullOrWhiteSpace(customer) && !String.IsNullOrWhiteSpace(planName))
            {
                if (!customerPlan.ContainsKey(customer)) customerPlan[customer] = planName;
            }
        }

        var chargesUrl = baseUrl + "/charges?limit=100";
        var chargesJson = HttpGet(chargesUrl, key);
        var chargesMap = Json.Deserialize<Dictionary<string, object>>(chargesJson);
        var charges = AsList(GetVal(chargesMap, "data"));

        decimal total = 0m;
        var list = new List<PaymentItem>();

        foreach (var raw in charges)
        {
            var c = AsMap(raw);
            var paid = AsBool(GetVal(c, "paid"));
            var status = AsString(GetVal(c, "status"));
            var amountCents = AsLong(GetVal(c, "amount"));
            var amount = amountCents / 100m;
            var currency = AsString(GetVal(c, "currency")).ToUpperInvariant();
            var created = AsLong(GetVal(c, "created"));
            var dateText = UnixToLocalDate(created);

            var billing = AsMap(GetVal(c, "billing_details"));
            var name = AsString(GetVal(billing, "name"));
            var email = AsString(GetVal(billing, "email"));
            if (String.IsNullOrWhiteSpace(email)) email = AsString(GetVal(c, "receipt_email"));

            var customer = AsString(GetVal(c, "customer"));
            var plan = "Sin plan";
            if (!String.IsNullOrWhiteSpace(customer) && customerPlan.ContainsKey(customer))
            {
                plan = customerPlan[customer];
            }
            else
            {
                var meta = AsMap(GetVal(c, "metadata"));
                var metaPlan = AsString(GetVal(meta, "plan"));
                if (!String.IsNullOrWhiteSpace(metaPlan)) plan = metaPlan;
            }

            var p = new PaymentItem();
            p.DateText = dateText;
            p.Name = String.IsNullOrWhiteSpace(name) ? "(sin nombre)" : name;
            p.Email = String.IsNullOrWhiteSpace(email) ? "(sin email)" : email;
            p.Plan = plan;
            p.Status = String.IsNullOrWhiteSpace(status) ? "unknown" : status;
            p.Currency = String.IsNullOrWhiteSpace(currency) ? "USD" : currency;
            p.Amount = amount;
            list.Add(p);

            if (paid || String.Equals(status, "succeeded", StringComparison.OrdinalIgnoreCase))
            {
                total += amount;
            }
        }

        list.Sort((a, b) => String.CompareOrdinal(b.DateText, a.DateText));
        snap.Payments = list;
        snap.PaymentsCount = list.Count;
        snap.TotalRevenue = total;
    }

    private static void LoadUsersFromKv(BusinessConfig cfg, FinanceSnapshot snap)
    {
        var url = (cfg.KvRestApiUrl ?? "").Trim().TrimEnd('/');
        var token = (cfg.KvRestApiToken ?? "").Trim();
        if (String.IsNullOrWhiteSpace(url) || String.IsNullOrWhiteSpace(token))
        {
            LoadUsersFromEndpoint(cfg, snap);
            return;
        }

        var keysRes = KvPipeline(url, token, new object[] { "KEYS", "iajuris:user:*" });
        var keys = AsList(keysRes);
        if (keys.Count == 0)
        {
            snap.Users = new List<UserItem>();
            return;
        }

        var mgetArgs = new ArrayList();
        mgetArgs.Add("MGET");
        for (var i = 0; i < keys.Count; i++) mgetArgs.Add(AsString(keys[i]));
        var mgetRes = KvPipeline(url, token, mgetArgs.ToArray());
        var rows = AsList(mgetRes);

        var users = new List<UserItem>();
        foreach (var r in rows)
        {
            var json = AsString(r);
            if (String.IsNullOrWhiteSpace(json)) continue;
            Dictionary<string, object> u;
            try { u = Json.Deserialize<Dictionary<string, object>>(json); }
            catch { continue; }
            if (u == null) continue;

            var it = new UserItem();
            it.FullName = AsString(GetVal(u, "fullName"));
            it.Email = AsString(GetVal(u, "email"));
            it.Verified = AsBool(GetVal(u, "emailVerified"));
            var createdAt = AsString(GetVal(u, "createdAt"));
            it.DateText = NormalizeDate(createdAt);

            if (String.IsNullOrWhiteSpace(it.FullName)) it.FullName = "(sin nombre)";
            if (String.IsNullOrWhiteSpace(it.Email)) it.Email = "(sin email)";
            users.Add(it);
        }

        users.Sort((a, b) => String.CompareOrdinal(b.DateText, a.DateText));
        snap.Users = users;
    }

    private static void LoadUsersFromEndpoint(BusinessConfig cfg, FinanceSnapshot snap)
    {
        var endpoint = (cfg.UsersReportUrl ?? "").Trim();
        if (String.IsNullOrWhiteSpace(endpoint))
        {
            snap.Warning = MergeWarning(snap.Warning, "Falta KvRestApiUrl/KvRestApiToken o UsersReportUrl");
            return;
        }

        var token = (cfg.UsersReportToken ?? "").Trim();
        if (String.IsNullOrWhiteSpace(token))
        {
            token = process.envOrEmpty("INTERNAL_AI_API_KEY").Trim();
        }

        var payload = HttpGet(endpoint, token);
        var map = Json.Deserialize<Dictionary<string, object>>(payload);
        var rows = AsList(GetVal(map, "users"));

        var users = new List<UserItem>();
        foreach (var raw in rows)
        {
            var u = AsMap(raw);
            var it = new UserItem();
            it.FullName = AsString(GetVal(u, "fullName"));
            it.Email = AsString(GetVal(u, "email"));
            it.Verified = AsBool(GetVal(u, "emailVerified"));
            it.DateText = NormalizeDate(AsString(GetVal(u, "createdAt")));
            if (String.IsNullOrWhiteSpace(it.FullName)) it.FullName = "(sin nombre)";
            if (String.IsNullOrWhiteSpace(it.Email)) it.Email = "(sin email)";
            users.Add(it);
        }

        users.Sort((a, b) => String.CompareOrdinal(b.DateText, a.DateText));
        snap.Users = users;
        var storageMode = AsString(GetVal(map, "storageMode"));
        if (String.Equals(storageMode, "memory", StringComparison.OrdinalIgnoreCase))
        {
            snap.Warning = MergeWarning(snap.Warning, "Usuarios en modo memory (no persistente en produccion)");
        }
    }

    public static bool CorrectUser(BusinessConfig cfg, string currentEmail, string fullName, string email, out string message)
    {
        message = "";
        var endpoint = ResolveUsersCorrectUrl(cfg);
        if (String.IsNullOrWhiteSpace(endpoint))
        {
            message = "No se pudo resolver UsersCorrectUrl";
            return false;
        }

        var token = (cfg.UsersReportToken ?? "").Trim();
        if (String.IsNullOrWhiteSpace(token))
        {
            token = process.envOrEmpty("INTERNAL_AI_API_KEY").Trim();
        }

        var bodyMap = new Dictionary<string, object>();
        bodyMap["operation"] = "correct-user";
        bodyMap["currentEmail"] = currentEmail ?? "";
        bodyMap["fullName"] = fullName ?? "";
        bodyMap["email"] = email ?? "";

        try
        {
            var payload = HttpPostJson(endpoint, token, Json.Serialize(bodyMap));
            var map = Json.Deserialize<Dictionary<string, object>>(payload);
            var ok = AsBool(GetVal(map, "ok"));
            if (!ok)
            {
                message = AsString(GetVal(map, "error"));
                if (String.IsNullOrWhiteSpace(message)) message = "No se pudo guardar la correccion";
                return false;
            }

            message = AsString(GetVal(map, "message"));
            if (String.IsNullOrWhiteSpace(message)) message = "Correccion guardada";
            return true;
        }
        catch (Exception ex)
        {
            message = ex.Message;
            return false;
        }
    }

    private static string ResolveUsersCorrectUrl(BusinessConfig cfg)
    {
        var explicitUrl = (cfg.UsersCorrectUrl ?? "").Trim();
        if (!String.IsNullOrWhiteSpace(explicitUrl)) return explicitUrl;

        var reportUrl = (cfg.UsersReportUrl ?? "").Trim();
        if (String.IsNullOrWhiteSpace(reportUrl)) return "";

        if (reportUrl.EndsWith("/users-report", StringComparison.OrdinalIgnoreCase))
        {
            return reportUrl;
        }

        return reportUrl;
    }

    private static object KvPipeline(string baseUrl, string token, object[] command)
    {
        var req = (HttpWebRequest)WebRequest.Create(baseUrl + "/pipeline");
        req.Method = "POST";
        req.ContentType = "application/json";
        req.Headers[HttpRequestHeader.Authorization] = "Bearer " + token;

        var payload = new Dictionary<string, object>();
        payload["commands"] = new object[] { command };
        var body = Encoding.UTF8.GetBytes(Json.Serialize(payload));
        using (var rs = req.GetRequestStream()) rs.Write(body, 0, body.Length);

        using (var resp = (HttpWebResponse)req.GetResponse())
        using (var sr = new StreamReader(resp.GetResponseStream(), Encoding.UTF8))
        {
            var text = sr.ReadToEnd();
            var arr = Json.Deserialize<ArrayList>(text);
            if (arr == null || arr.Count == 0) return new ArrayList();
            var first = AsMap(arr[0]);
            var err = AsString(GetVal(first, "error"));
            if (!String.IsNullOrWhiteSpace(err)) throw new Exception(err);
            return GetVal(first, "result");
        }
    }

    private static string HttpGet(string url, string bearerToken)
    {
        var req = (HttpWebRequest)WebRequest.Create(url);
        req.Method = "GET";
        if (!String.IsNullOrWhiteSpace(bearerToken))
        {
            req.Headers[HttpRequestHeader.Authorization] = "Bearer " + bearerToken;
        }
        req.Accept = "application/json";

        using (var resp = (HttpWebResponse)req.GetResponse())
        using (var sr = new StreamReader(resp.GetResponseStream(), Encoding.UTF8))
        {
            return sr.ReadToEnd();
        }
    }

    private static string HttpPostJson(string url, string bearerToken, string json)
    {
        var req = (HttpWebRequest)WebRequest.Create(url);
        req.Method = "POST";
        req.ContentType = "application/json";
        req.Accept = "application/json";
        if (!String.IsNullOrWhiteSpace(bearerToken))
        {
            req.Headers[HttpRequestHeader.Authorization] = "Bearer " + bearerToken;
        }

        var body = Encoding.UTF8.GetBytes(json ?? "{}");
        using (var rs = req.GetRequestStream()) rs.Write(body, 0, body.Length);

        using (var resp = (HttpWebResponse)req.GetResponse())
        using (var sr = new StreamReader(resp.GetResponseStream(), Encoding.UTF8))
        {
            return sr.ReadToEnd();
        }
    }

    private static string ExtractSubscriptionPlan(Dictionary<string, object> sub)
    {
        var items = AsMap(GetVal(sub, "items"));
        var data = AsList(GetVal(items, "data"));
        if (data.Count == 0) return "";
        var item = AsMap(data[0]);
        var price = AsMap(GetVal(item, "price"));
        var nickname = AsString(GetVal(price, "nickname"));
        if (!String.IsNullOrWhiteSpace(nickname)) return nickname;
        var plan = AsMap(GetVal(item, "plan"));
        var oldName = AsString(GetVal(plan, "nickname"));
        if (!String.IsNullOrWhiteSpace(oldName)) return oldName;
        var recurring = AsMap(GetVal(price, "recurring"));
        var interval = AsString(GetVal(recurring, "interval"));
        var amount = AsLong(GetVal(price, "unit_amount"));
        var cur = AsString(GetVal(price, "currency")).ToUpperInvariant();
        if (amount > 0) return (amount / 100m).ToString("N2", CultureInfo.InvariantCulture) + " " + cur + "/" + (String.IsNullOrWhiteSpace(interval) ? "periodo" : interval);
        return "Plan activo";
    }

    private static string NormalizeDate(string raw)
    {
        if (String.IsNullOrWhiteSpace(raw)) return "";
        DateTime dt;
        if (DateTime.TryParse(raw, out dt)) return dt.ToString("yyyy-MM-dd HH:mm");
        return raw;
    }

    private static string UnixToLocalDate(long unix)
    {
        if (unix <= 0) return "";
        var epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var dt = epoch.AddSeconds(unix).ToLocalTime();
        return dt.ToString("yyyy-MM-dd HH:mm");
    }

    private static string MergeWarning(string current, string next)
    {
        if (String.IsNullOrWhiteSpace(current)) return next;
        return current + " | " + next;
    }

    private static string ReadString(Dictionary<string, object> map, string key, string fallback)
    {
        object v; if (!map.TryGetValue(key, out v) || v == null) return fallback;
        var s = Convert.ToString(v);
        return String.IsNullOrWhiteSpace(s) ? fallback : s;
    }

    private static int ReadInt(Dictionary<string, object> map, string key, int fallback)
    {
        object v; if (!map.TryGetValue(key, out v) || v == null) return fallback;
        int i; return Int32.TryParse(Convert.ToString(v), out i) && i > 0 ? i : fallback;
    }

    private static object GetVal(Dictionary<string, object> map, string key)
    {
        if (map == null) return null;
        object v; return map.TryGetValue(key, out v) ? v : null;
    }

    private static Dictionary<string, object> AsMap(object v)
    {
        return v as Dictionary<string, object> ?? new Dictionary<string, object>();
    }

    private static ArrayList AsList(object v)
    {
        return v as ArrayList ?? new ArrayList();
    }

    private static string AsString(object v)
    {
        return v == null ? "" : Convert.ToString(v);
    }

    private static bool AsBool(object v)
    {
        if (v == null) return false;
        bool b; if (Boolean.TryParse(Convert.ToString(v), out b)) return b;
        return String.Equals(Convert.ToString(v), "1", StringComparison.OrdinalIgnoreCase);
    }

    private static long AsLong(object v)
    {
        if (v == null) return 0;
        long l; if (Int64.TryParse(Convert.ToString(v), out l)) return l;
        double d; if (Double.TryParse(Convert.ToString(v), NumberStyles.Any, CultureInfo.InvariantCulture, out d)) return (long)d;
        return 0;
    }
}

internal sealed class BusinessForm : Form
{
    private readonly BusinessConfig _config;
    private readonly string _configPath;
    private readonly Label _lblRevenue;
    private readonly Label _lblPayments;
    private readonly Label _lblUsers;
    private readonly Label _lblWarning;
    private readonly Label _lblNext;
    private readonly DataGridView _gridPayments;
    private readonly DataGridView _gridUsers;
    private readonly System.Windows.Forms.Timer _timer;
    private int _countdown;

    public BusinessForm(BusinessConfig config, string configPath)
    {
        _config = config;
        _configPath = configPath;

        Text = "IA Juris - Control Comercial";
        StartPosition = FormStartPosition.CenterScreen;
        Size = new Size(1180, 740);
        MinimumSize = new Size(1100, 680);
        BackColor = Color.FromArgb(12, 20, 38);

        var title = new Label
        {
            Text = "IA Juris - Control de Ingresos y Usuarios Reales",
            ForeColor = Color.FromArgb(0, 208, 170),
            Font = new Font("Segoe UI", 16f, FontStyle.Bold),
            AutoSize = true,
            Location = new Point(16, 12)
        };

        _lblRevenue = BuildStatLabel("Total ganado: --", 16, 58);
        _lblPayments = BuildStatLabel("Pagos registrados: --", 400, 58);
        _lblUsers = BuildStatLabel("Total usuarios reales: --", 760, 58);

        _lblWarning = new Label
        {
            Text = "",
            ForeColor = Color.FromArgb(255, 203, 107),
            Font = new Font("Segoe UI", 9f, FontStyle.Bold),
            AutoSize = false,
            Location = new Point(16, 94),
            Size = new Size(1135, 22)
        };

        var btnRefresh = BuildButton("Actualizar ahora", 16, 122, Color.FromArgb(0, 117, 220));
        btnRefresh.Click += (s, e) => { _countdown = Math.Max(15, _config.RefreshSeconds); RefreshData(); };

        var btnConfig = BuildButton("Abrir config", 174, 122, Color.FromArgb(59, 70, 102));
        btnConfig.Click += (s, e) => { Process.Start("explorer.exe", _configPath); };

        var btnCorrectUser = BuildButton("Corregir usuario", 332, 122, Color.FromArgb(32, 127, 90));
        btnCorrectUser.Click += (s, e) => CorrectSelectedUser();

        _lblNext = new Label
        {
            Text = "",
            ForeColor = Color.FromArgb(150, 168, 196),
            Font = new Font("Segoe UI", 9f, FontStyle.Regular),
            AutoSize = true,
            Location = new Point(340, 130)
        };

        var payTitle = new Label
        {
            Text = "Pagos Stripe (nombre, email, plan, monto)",
            ForeColor = Color.White,
            Font = new Font("Segoe UI", 11f, FontStyle.Bold),
            AutoSize = true,
            Location = new Point(16, 160)
        };

        _gridPayments = CreateGrid(new Point(16, 188), new Size(1135, 250));
        _gridPayments.Columns.Add("cDate", "Fecha");
        _gridPayments.Columns.Add("cName", "Nombre");
        _gridPayments.Columns.Add("cEmail", "Email");
        _gridPayments.Columns.Add("cPlan", "Plan");
        _gridPayments.Columns.Add("cAmount", "Monto");
        _gridPayments.Columns.Add("cStatus", "Estado");

        var usersTitle = new Label
        {
            Text = "Usuarios reales registrados",
            ForeColor = Color.White,
            Font = new Font("Segoe UI", 11f, FontStyle.Bold),
            AutoSize = true,
            Location = new Point(16, 452)
        };

        _gridUsers = CreateGrid(new Point(16, 480), new Size(1135, 200));
        _gridUsers.Columns.Add("uDate", "Fecha registro");
        _gridUsers.Columns.Add("uName", "Nombre");
        _gridUsers.Columns.Add("uEmail", "Email");
        _gridUsers.Columns.Add("uVer", "Verificado");

        Controls.Add(title);
        Controls.Add(_lblRevenue);
        Controls.Add(_lblPayments);
        Controls.Add(_lblUsers);
        Controls.Add(_lblWarning);
        Controls.Add(btnRefresh);
        Controls.Add(btnConfig);
        Controls.Add(btnCorrectUser);
        Controls.Add(_lblNext);
        Controls.Add(payTitle);
        Controls.Add(_gridPayments);
        Controls.Add(usersTitle);
        Controls.Add(_gridUsers);

        _countdown = Math.Max(1, _config.RefreshSeconds);
        _timer = new System.Windows.Forms.Timer { Interval = 1000 };
        _timer.Tick += (s, e) =>
        {
            _countdown--;
            _lblNext.Text = "Proxima actualizacion en " + _countdown + "s";
            if (_countdown <= 0)
            {
                _countdown = Math.Max(1, _config.RefreshSeconds);
                RefreshData();
            }
        };
        _timer.Start();

        Shown += (s, e) => RefreshData();
    }

    protected override void OnFormClosed(FormClosedEventArgs e)
    {
        _timer.Stop();
        _timer.Dispose();
        base.OnFormClosed(e);
    }

    private void RefreshData()
    {
        _lblWarning.Text = "Actualizando datos...";
        ThreadPool.QueueUserWorkItem(delegate
        {
            var snap = BusinessData.BuildSnapshot(_config);
            BeginInvoke(new Action(delegate
            {
                _lblRevenue.Text = "Total ganado: " + snap.TotalRevenue.ToString("N2") + " USD";
                _lblPayments.Text = "Pagos registrados: " + snap.PaymentsCount;
                _lblUsers.Text = "Total usuarios reales: " + snap.Users.Count;
                _lblWarning.Text = String.IsNullOrWhiteSpace(snap.Warning) ? "" : ("Aviso: " + snap.Warning);

                _gridPayments.Rows.Clear();
                for (var i = 0; i < snap.Payments.Count; i++)
                {
                    var p = snap.Payments[i];
                    _gridPayments.Rows.Add(p.DateText, p.Name, p.Email, p.Plan, p.Amount.ToString("N2") + " " + p.Currency, p.Status);
                }

                _gridUsers.Rows.Clear();
                for (var i = 0; i < snap.Users.Count; i++)
                {
                    var u = snap.Users[i];
                    var hasPaidPlan = UserHasPaidPlan(snap, u.Email);
                    var verificationText = hasPaidPlan ? "SI" : "SI / SIN PLAN DE PAGO REGISTRADO";
                    _gridUsers.Rows.Add(u.DateText, u.FullName, u.Email, verificationText);
                }
            }));
        });
    }

    private void CorrectSelectedUser()
    {
        if (_gridUsers.SelectedRows.Count <= 0)
        {
            MessageBox.Show("Selecciona un usuario en la tabla para corregir.", "IA Juris", MessageBoxButtons.OK, MessageBoxIcon.Information);
            return;
        }

        var row = _gridUsers.SelectedRows[0];
        var currentName = Convert.ToString(row.Cells[1].Value ?? "").Trim();
        var currentEmail = Convert.ToString(row.Cells[2].Value ?? "").Trim();

        using (var dialog = new UserCorrectionDialog(currentName, currentEmail))
        {
            if (dialog.ShowDialog(this) != DialogResult.OK) return;

            var newName = (dialog.FullNameValue ?? "").Trim();
            var newEmail = (dialog.EmailValue ?? "").Trim();
            if (String.IsNullOrWhiteSpace(newName) && String.IsNullOrWhiteSpace(newEmail))
            {
                MessageBox.Show("Debes completar nombre o correo.", "IA Juris", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            string message;
            var ok = BusinessData.CorrectUser(_config, currentEmail, newName, newEmail, out message);
            if (!ok)
            {
                MessageBox.Show("No se pudo guardar la correccion: " + message, "IA Juris", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            MessageBox.Show(message, "IA Juris", MessageBoxButtons.OK, MessageBoxIcon.Information);
            RefreshData();
        }
    }

    private static bool UserHasPaidPlan(FinanceSnapshot snap, string email)
    {
        var normalizedEmail = (email ?? "").Trim();
        if (String.IsNullOrWhiteSpace(normalizedEmail) || normalizedEmail == "(sin email)")
        {
            return false;
        }

        for (var i = 0; i < snap.Payments.Count; i++)
        {
            var payment = snap.Payments[i];
            if (!String.Equals((payment.Email ?? "").Trim(), normalizedEmail, StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            if (String.Equals((payment.Status ?? "").Trim(), "succeeded", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }

    private static Label BuildStatLabel(string text, int x, int y)
    {
        return new Label
        {
            Text = text,
            ForeColor = Color.FromArgb(228, 235, 245),
            Font = new Font("Segoe UI", 13f, FontStyle.Bold),
            AutoSize = true,
            Location = new Point(x, y)
        };
    }

    private static Button BuildButton(string text, int x, int y, Color bg)
    {
        var b = new Button
        {
            Text = text,
            Location = new Point(x, y),
            Size = new Size(146, 32),
            BackColor = bg,
            ForeColor = Color.White,
            FlatStyle = FlatStyle.Flat,
            Font = new Font("Segoe UI", 9f, FontStyle.Bold)
        };
        b.FlatAppearance.BorderSize = 0;
        return b;
    }

    private static DataGridView CreateGrid(Point location, Size size)
    {
        var g = new DataGridView
        {
            Location = location,
            Size = size,
            BackgroundColor = Color.FromArgb(20, 33, 57),
            BorderStyle = BorderStyle.None,
            GridColor = Color.FromArgb(55, 76, 122),
            ForeColor = Color.White,
            RowHeadersVisible = false,
            AllowUserToAddRows = false,
            AllowUserToDeleteRows = false,
            ReadOnly = true,
            MultiSelect = false,
            SelectionMode = DataGridViewSelectionMode.FullRowSelect,
            AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill
        };

        g.ColumnHeadersDefaultCellStyle = new DataGridViewCellStyle
        {
            BackColor = Color.FromArgb(8, 26, 52),
            ForeColor = Color.White,
            Font = new Font("Segoe UI", 9f, FontStyle.Bold)
        };

        g.DefaultCellStyle = new DataGridViewCellStyle
        {
            BackColor = Color.FromArgb(20, 33, 57),
            ForeColor = Color.FromArgb(229, 238, 250),
            SelectionBackColor = Color.FromArgb(0, 117, 220),
            SelectionForeColor = Color.White,
            Font = new Font("Segoe UI", 9f, FontStyle.Regular)
        };

        return g;
    }
}

internal sealed class UserCorrectionDialog : Form
{
    private readonly TextBox _txtFullName;
    private readonly TextBox _txtEmail;

    public string FullNameValue { get { return _txtFullName.Text; } }
    public string EmailValue { get { return _txtEmail.Text; } }

    public UserCorrectionDialog(string fullName, string email)
    {
        Text = "Corregir usuario";
        StartPosition = FormStartPosition.CenterParent;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MinimizeBox = false;
        MaximizeBox = false;
        Size = new Size(520, 230);
        BackColor = Color.FromArgb(12, 20, 38);

        var lblName = new Label
        {
            Text = "Nombre corregido:",
            ForeColor = Color.White,
            AutoSize = true,
            Location = new Point(20, 22)
        };

        _txtFullName = new TextBox
        {
            Location = new Point(20, 44),
            Size = new Size(468, 24),
            Text = fullName ?? ""
        };

        var lblEmail = new Label
        {
            Text = "Correo corregido:",
            ForeColor = Color.White,
            AutoSize = true,
            Location = new Point(20, 82)
        };

        _txtEmail = new TextBox
        {
            Location = new Point(20, 104),
            Size = new Size(468, 24),
            Text = email ?? ""
        };

        var btnSave = new Button
        {
            Text = "Guardar",
            DialogResult = DialogResult.OK,
            Location = new Point(290, 146),
            Size = new Size(95, 32),
            BackColor = Color.FromArgb(0, 117, 220),
            ForeColor = Color.White,
            FlatStyle = FlatStyle.Flat
        };
        btnSave.FlatAppearance.BorderSize = 0;

        var btnCancel = new Button
        {
            Text = "Cancelar",
            DialogResult = DialogResult.Cancel,
            Location = new Point(393, 146),
            Size = new Size(95, 32),
            BackColor = Color.FromArgb(59, 70, 102),
            ForeColor = Color.White,
            FlatStyle = FlatStyle.Flat
        };
        btnCancel.FlatAppearance.BorderSize = 0;

        Controls.Add(lblName);
        Controls.Add(_txtFullName);
        Controls.Add(lblEmail);
        Controls.Add(_txtEmail);
        Controls.Add(btnSave);
        Controls.Add(btnCancel);

        AcceptButton = btnSave;
        CancelButton = btnCancel;
    }
}

internal sealed class WelcomeForm : Form
{
    public WelcomeForm()
    {
        Text = "Bienvenida";
        StartPosition = FormStartPosition.CenterScreen;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;
        MinimizeBox = false;
        Size = new Size(760, 280);
        BackColor = Color.FromArgb(12, 20, 38);

        var title = new Label
        {
            Text = "BIENVENIDO JOANCARLOS CASADO NOVA",
            ForeColor = Color.FromArgb(0, 208, 170),
            Font = new Font("Segoe UI", 20f, FontStyle.Bold),
            AutoSize = false,
            Size = new Size(710, 64),
            Location = new Point(25, 45),
            TextAlign = ContentAlignment.MiddleCenter
        };

        var subtitle = new Label
        {
            Text = "IA Juris - Control Comercial",
            ForeColor = Color.FromArgb(205, 218, 236),
            Font = new Font("Segoe UI", 12f, FontStyle.Regular),
            AutoSize = false,
            Size = new Size(710, 30),
            Location = new Point(25, 114),
            TextAlign = ContentAlignment.MiddleCenter
        };

        var btnContinue = new Button
        {
            Text = "Entrar",
            Size = new Size(130, 38),
            Location = new Point(310, 176),
            BackColor = Color.FromArgb(0, 117, 220),
            ForeColor = Color.White,
            FlatStyle = FlatStyle.Flat,
            Font = new Font("Segoe UI", 10f, FontStyle.Bold)
        };
        btnContinue.FlatAppearance.BorderSize = 0;
        btnContinue.Click += (s, e) =>
        {
            DialogResult = DialogResult.OK;
            Close();
        };

        Controls.Add(title);
        Controls.Add(subtitle);
        Controls.Add(btnContinue);

        AcceptButton = btnContinue;
    }
}

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);

        var exeDir = AppDomain.CurrentDomain.BaseDirectory;
        var configPath = Path.Combine(exeDir, "ia_juris_business_launcher.config.json");
        var cfg = BusinessData.LoadConfig(configPath);

        using (var welcome = new WelcomeForm())
        {
            welcome.ShowDialog();
        }

        Application.Run(new BusinessForm(cfg, configPath));
    }
}

internal static class process
{
    public static string envOrEmpty(string name)
    {
        try
        {
            return Environment.GetEnvironmentVariable(name) ?? "";
        }
        catch
        {
            return "";
        }
    }
}
