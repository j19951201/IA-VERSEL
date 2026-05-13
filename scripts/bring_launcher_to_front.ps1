Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Diagnostics;

public class WindowController {
    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    
    [DllImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool SetForegroundWindow(IntPtr hWnd);
    
    [DllImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool IsWindowVisible(IntPtr hWnd);
    
    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr GetWindowRect(IntPtr hWnd, out RECT lpRect);
    
    public struct RECT {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }
    
    private const int SW_SHOW = 5;
    private const int SW_RESTORE = 9;
    private const int SW_NORMAL = 1;
    
    public static void BringToFront(IntPtr hWnd) {
        if (hWnd == IntPtr.Zero) return;
        ShowWindow(hWnd, SW_RESTORE);
        ShowWindow(hWnd, SW_NORMAL);
        SetForegroundWindow(hWnd);
    }
    
    public static bool IsVisible(IntPtr hWnd) {
        return IsWindowVisible(hWnd);
    }
    
    public static void GetWindowInfo(IntPtr hWnd, out bool visible, out string rect) {
        visible = IsWindowVisible(hWnd);
        RECT r;
        GetWindowRect(hWnd, out r);
        rect = string.Format("({0},{1}) to ({2},{3})", r.Left, r.Top, r.Right, r.Bottom);
    }
}
"@

Write-Output "[*] Buscando ventanas de 'IA Juris - Control Comercial'..."
$procs = Get-Process powershell -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -match 'Control Comercial' }

if ($procs) {
    Write-Output "[+] Encontradas $($procs.Count) ventana(s)"
    
    foreach ($proc in $procs) {
        $visible = $false
        $rect = ""
        try {
            [WindowController]::GetWindowInfo($proc.MainWindowHandle, [ref]$visible, [ref]$rect)
        } catch {}
        
        Write-Output "[*] PID: $($proc.Id), Visible: $visible, Rect: $rect"
        Write-Output "[+] Trayendo a frente..."
        [WindowController]::BringToFront($proc.MainWindowHandle)
    }
    
    Write-Output "[OK] Ventana(s) traida(s) al frente"
} else {
    Write-Output "[!] No se encontraron ventanas"
}
