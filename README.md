## How to prepare the server

1. In order to be able to connect the clients (the game instances) to the server, the server needs to be running in a computer that is connected to the same network as the clients.
2. This connection can be done through a local network (the clients and the server are connected in a LAN or WLAN Network) or through the internet (the server has a public IP address that can be reached through the internet).
3. Normally, if the server and the clients are in the same WLAN or LAN they can reach each other without any additional configuration. Private company networks normally allow this communication.
4. The server can be executed in every operating system.
5. The server needs to have Node.js installed. You can download it from the official website: https://nodejs.org/en/download/. The server can be executed with Node.js 20 or higher.

## How to run the server

1. Download the server files and place them anywhere you want in the server computer.
2. Place yourself in the server folder and open a terminal in that folder. You can do this by right-clicking in the folder and selecting the option "Open terminal here" if you are in a gui environment or by moving through the folders if you are in a cli environment.
3. Once you have the terminal open in the server folder, execute the following command: `npm start`. This command will install all the dependencies needed and will run the server.
4. To close the server you only need to focus on the terminal window and press `Ctrl + C`.
5. To ensure optimal server conditions for each test, it is recommended to restart the server. To do this, simply close the server and run the `npm start` command again.

## Cómo preparar el servidor

1. Para poder conectar los clientes (las instancias del juego) al servidor, el servidor necesita estar ejecutándose en un ordenador que esté conectado a la misma red que los clientes.
2. Esta conexión puede hacerse a través de una red local (los clientes y el servidor están conectados en una red LAN o WLAN) o a través de internet (el servidor tiene una dirección IP pública que puede ser alcanzada a través de internet).
3. Normalmente, si el servidor y los clientes están en la misma WLAN o LAN pueden alcanzarse sin ninguna configuración adicional. Las redes privadas de empresas normalmente permiten esta comunicación.
4. El servidor puede ser ejecutado en cualquier sistema operativo.
5. El servidor necesita tener Node.js instalado. Puedes descargarlo desde la página web oficial: https://nodejs.org/en/download/. El servidor puede ser ejecutado con Node.js 20 o superior.

## Cómo ejecutar el servidor

1. Descarga los archivos del servidor y colócalos en cualquier lugar que desees en el ordenador del servidor.
2. Colócate en la carpeta del servidor y abre una terminal en esa carpeta. Puedes hacer esto haciendo clic derecho en la carpeta y seleccionando la opción "Abrir terminal aquí" si estás en un entorno gráfico o moviéndote a través de las carpetas si estás en un entorno de línea de comandos.
3. Una vez que tengas la terminal abierta en la carpeta del servidor, ejecuta el siguiente comando: `npm start`. Este comando instalará todas las dependencias necesarias y ejecutará el servidor.
4. Para cerrar el servidor solo necesitas enfocarte en la ventana de la terminal y presionar `Ctrl + C`.
5. Para asegurar condiciones óptimas del servidor para cada prueba, se recomienda reiniciar el servidor. Para hacer esto, simplemente cierra el servidor y ejecuta el comando `npm start` de nuevo.
