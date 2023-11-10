# #!/bin/bash

# # Exécute npm start en arrière-plan et enregistre le PID dans un fichier
# npm start & echo $! > server_pid.txt

# # Attendez 0,5 seconde (500 millisecondes)
# sleep 0.5

# # Ouvre la page web dans Firefox
# open "http://localhost:8000"

# # Attend que l'utilisateur appuie sur "Entrée" pour quitter
# read -p "Appuyez sur Entrée pour quitter..."

# # Récupère le PID du serveur à partir du fichier et tue le processus
# server_pid=$(cat server_pid.txt)
# kill $server_pid

#!/bin/bash

#!/bin/bash

npm install

# Ensuite, ouvrez la page web dans Firefox
open "http://localhost:8000"

# Exécute npm start en premier plan
npm start

# Attend que l'utilisateur appuie sur "Entrée" pour quitter
read -p "Appuyez sur Entrée pour quitter..."



