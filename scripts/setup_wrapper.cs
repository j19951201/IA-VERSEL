using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Windows.Forms;

public class SetupWrapper
{
    [STAThread]
    public static int Main(string[] args)
    {
        try
        {
            Console.OutputEncoding = System.Text.Encoding.UTF8;
            
            // Obtener ubicación del script batch
            string batchScript = Path.Combine(
                Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location),
                "proyecto_eliosmind2b_setup.bat"
            );

            if (!File.Exists(batchScript))
            {
                MessageBox.Show(
                    "Error: No se encontró el archivo de configuración.\n" +
                    "Asegúrate de que 'proyecto_eliosmind2b_setup.bat' esté en la misma carpeta.",
                    "Error de Instalación",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
                return 1;
            }

            // Ejecutar el script batch
            ProcessStartInfo psi = new ProcessStartInfo
            {
                FileName = "cmd.exe",
                Arguments = $"/c \"{batchScript}\"",
                UseShellExecute = false,
                CreateNoWindow = false,
                WindowStyle = ProcessWindowStyle.Normal
            };

            using (Process process = Process.Start(psi))
            {
                process.WaitForExit();
                return process.ExitCode;
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                $"Error durante la instalación:\n\n{ex.Message}",
                "Error",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error
            );
            return 1;
        }
    }
}
