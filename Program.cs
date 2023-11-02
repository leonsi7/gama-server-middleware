using System;
using System.Data.Common;
using System.Net.WebSockets;
using Newtonsoft.Json;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

class Program
{
    private const string serverUri = "ws://localhost:8080/";
    private Guid id_guid;
    private string id_vr;


    public Program()
    {
        id_guid = Guid.NewGuid();
        id_vr = id_guid.ToString(); //"a50f3901-dd08-4192-9373-c2f88f63667a";
    }

    static async Task Main(string[] args)
    {
        using (ClientWebSocket webSocket = new ClientWebSocket())
        {   
            Program program = new Program();
            var jsonId = new Dictionary<string,string> {
                {"type", "connection"},
                { "id", program.id_vr}
            };
            string jsonStringId = JsonConvert.SerializeObject(jsonId);
            try
            {   
                await webSocket.ConnectAsync(new Uri(serverUri), CancellationToken.None);
                Console.WriteLine("Connected to WebSocket server");
                // Envoyer un message au serveur
                byte[] messageBytes = Encoding.UTF8.GetBytes(jsonStringId);
                await webSocket.SendAsync(new ArraySegment<byte>(messageBytes), WebSocketMessageType.Text, true, CancellationToken.None);

                // Recevoir des messages du serveur
                byte[] receiveBuffer = new byte[4096];
                while (webSocket.State == WebSocketState.Open)
                {
                    WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(receiveBuffer), CancellationToken.None);

                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        string receivedMessage = Encoding.UTF8.GetString(receiveBuffer, 0, result.Count);
                        Console.WriteLine($"Message reçu du serveur : {receivedMessage}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Une erreur s'est produite : {ex.Message}");
            }
            finally
            {
                if (webSocket.State == WebSocketState.Open || webSocket.State == WebSocketState.CloseReceived)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Fermeture normale", CancellationToken.None);
                }
            }
        }
    }
}
