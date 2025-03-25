package expo.modules.udp

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.BindException
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.net.SocketException
import kotlin.concurrent.thread

class ExpoUdpModule : Module() {
    private var serverSocket: DatagramSocket? = null
    private var clientSocket: DatagramSocket? = null
    private var isServerRunning = false
    private var isClientRunning = false

    override fun definition() = ModuleDefinition {
        Name("ExpoUdp")

        // Initialize UDP Server (unchanged)
        AsyncFunction("initServer") { port: Int, ip: String? ->
            try {
                if (isServerRunning || serverSocket?.isBound == true) {
                    throw Exception("Server already exists on port $port")
                }
                val serverIp = ip ?: "127.0.0.1"
                val address = InetAddress.getByName(serverIp)
                serverSocket = DatagramSocket(port, address).apply {
                    reuseAddress = true
                }
                isServerRunning = true
                thread(isDaemon = true) {
                    val buffer = ByteArray(1024)
                    while (isServerRunning && serverSocket != null && !serverSocket!!.isClosed) {
                        try {
                            val packet = DatagramPacket(buffer, buffer.size)
                            serverSocket?.receive(packet)
                            val message = String(packet.data, 0, packet.length)
                            sendEvent("onServerMessage", mapOf(
                                "message" to message,
                                "fromIp" to packet.address.hostAddress,
                                "fromPort" to packet.port
                            ))
                        } catch (e: SocketException) {
                            if (!isServerRunning) {
                                sendEvent("onServerDisconnected", mapOf("message" to "Server disconnected"))
                                cleanupServer()
                                break
                            }
                            sendEvent("onServerError", mapOf("error" to "Server socket error: ${e.message}"))
                        } catch (e: Exception) {
                            sendEvent("onServerError", mapOf("error" to "Unexpected server error: ${e.message}"))
                        }
                    }
                }
                "UDP Server initialized on $serverIp:$port"
            } catch (e: BindException) {
                throw Exception("Port $port is already in use on $ip")
            } catch (e: Exception) {
                throw Exception("Failed to start UDP server: ${e.message}")
            }
        }

        // Send UDP Message from Server (unchanged)
        AsyncFunction("sendServerMessage") { ip: String, port: Int, message: String ->
            try {
                if (!isServerRunning || serverSocket == null || serverSocket!!.isClosed) {
                    throw Exception("Server not initialized or closed")
                }
                val address = InetAddress.getByName(ip)
                val buffer = message.toByteArray()
                val packet = DatagramPacket(buffer, buffer.size, address, port)
                serverSocket?.send(packet)
                "Message sent from server to $ip:$port"
            } catch (e: SocketException) {
                throw Exception("Failed to send message: Client may not exist or is unreachable")
            } catch (e: Exception) {
                throw Exception("Failed to send message: ${e.message}")
            }
        }

        // Stop UDP Server (unchanged)
        AsyncFunction("stopServer") {
            try {
                if (!isServerRunning || serverSocket == null || serverSocket!!.isClosed) {
                    throw Exception("No server is running")
                }
                cleanupServer()
                "UDP Server stopped"
            } catch (e: Exception) {
                throw Exception("Failed to stop server: ${e.message}")
            }
        }

        // Initialize UDP Client (updated)
        AsyncFunction("initClient") { ip: String, port: Int ->
            try {
                if (isClientRunning || clientSocket?.isBound == true) {
                    throw Exception("Client already initialized")
                }
                clientSocket = DatagramSocket()
                val address: InetAddress
                try {
                    address = InetAddress.getByName(ip)
                } catch (e: Exception) {
                    sendEvent("onClientError", mapOf("error" to "Invalid IP address: $ip"))
                    return@AsyncFunction "UDP Client initialized (invalid IP)"
                }
                val testMessage = "PING".toByteArray()
                val packet = DatagramPacket(testMessage, testMessage.size, address, port)
                try {
                    clientSocket?.send(packet)
                } catch (e: SocketException) {
                    sendEvent("onClientError", mapOf("error" to "Failed to send PING to $ip:$port: ${e.message}"))
                }
                isClientRunning = true

                thread(isDaemon = true) {
                    val buffer = ByteArray(1024)
                    while (isClientRunning && clientSocket != null && !clientSocket!!.isClosed) {
                        try {
                            val receivePacket = DatagramPacket(buffer, buffer.size)
                            clientSocket?.receive(receivePacket)
                            val message = String(receivePacket.data, 0, receivePacket.length)
                            if (isClientRunning) {
                                sendEvent("onClientMessage", mapOf(
                                    "message" to message,
                                    "fromIp" to receivePacket.address.hostAddress,
                                    "fromPort" to receivePacket.port
                                ))
                            }
                        } catch (e: SocketException) {
                            if (!isClientRunning) break
                            sendEvent("onClientError", mapOf("error" to "Client socket error: ${e.message}"))
                        } catch (e: Exception) {
                            sendEvent("onClientError", mapOf("error" to "Unexpected client error: ${e.message}"))
                        }
                    }
                }
                "UDP Client initialized"
            } catch (e: Exception) {
                clientSocket?.close()
                clientSocket = null
                sendEvent("onClientError", mapOf("error" to "Critical failure initializing client: ${e.message}"))
                return@AsyncFunction "UDP Client failed to initialize: ${e.message}"
            }
        }

        // Send UDP Message from Client (unchanged)
        AsyncFunction("sendMessage") { ip: String, port: Int, message: String ->
            try {
                if (!isClientRunning || clientSocket == null || clientSocket!!.isClosed) {
                    throw Exception("Client not initialized or closed")
                }
                val address = InetAddress.getByName(ip)
                val buffer = message.toByteArray()
                val packet = DatagramPacket(buffer, buffer.size, address, port)
                clientSocket?.send(packet)
                "Message sent to $ip:$port"
            } catch (e: SocketException) {
                throw Exception("Failed to send message: Server may not exist or is unreachable")
            } catch (e: Exception) {
                throw Exception("Failed to send message: ${e.message}")
            }
        }

        // Stop UDP Client (unchanged)
        AsyncFunction("stopClient") {
            try {
                if (!isClientRunning || clientSocket == null || clientSocket!!.isClosed) {
                    throw Exception("No client is running")
                }
                isClientRunning = false
                clientSocket?.close()
                clientSocket = null
                "UDP Client stopped"
            } catch (e: Exception) {
                throw Exception("Failed to stop client: ${e.message}")
            }
        }

        // Events for server and client
        Events("onServerMessage", "onServerError", "onServerDisconnected", "onClientMessage", "onClientError")

        // Cleanup on module destruction
        OnDestroy {
            cleanupServer()
            isClientRunning = false
            clientSocket?.close()
            clientSocket = null
        }
    }

    private fun cleanupServer() {
        isServerRunning = false
        serverSocket?.close()
        serverSocket = null
    }
}