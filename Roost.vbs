' Lance Roost sans fenêtre console : démarre le serveur statique puis ouvre le navigateur.
Set sh = CreateObject("WScript.Shell")
appDir = "C:\Users\Anthony\Desktop\Roost\app"
sh.CurrentDirectory = appDir
' fenêtre masquée (0), ne pas attendre la fin (False)
sh.Run "node """ & appDir & "\scripts\serve.mjs""", 0, False
