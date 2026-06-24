<?php
namespace App\controllers;
use Firebase\JWT\JWT;
trait Token {
    protected function generarToken(string $idUsuario, int $rol, string $nombre) {
        $key = $_ENV['KEY'];
        $payload = [
            'iss' => $_SERVER['SERVER_NAME'],
            'iat' => time(),
            'exp' => time() + 45, // 30 minutos
            'sub' => $idUsuario,
            'rol' => $rol,
            'nom' => $nombre
        ];
        $payloadRef = [
            'iss' => $_SERVER['SERVER_NAME'],
            'iat' => time(),
            'rol' => $rol,
            'nom' => $nombre
        ];
        return [
            "token" => JWT::encode($payload, $key, 'HS256'),
            "tkRef" => JWT::encode($payloadRef, $key, 'HS256'),
        ];            
    }
    private function accederToken(string $proc, string $idUsuario, $tkRef = " ") {
        $sql = $proc === "modificar" ? "SELECT modificarToken " : "CALL verificarToken ";
        $sql .= "(:idUsuario, :tkRef);";

        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);

        $query->execute(['idUsuario' => $idUsuario, 'tkRef' => $tkRef]);
        $datos = $proc === 'modificar' ? $query->fetch(PDO::FETCH_NUM) : $query->fetchColumn();


        $query = null;
        $con = null;
        return $datos;
    }
    private function modificarToken(string $cedula, string $tkRef = "") {

        $url = "/token/modificar";

        return $this->ejecutar($url, 'PATCH', json_encode(['cedula' => $cedula, 'tkRef' => $tkRef]));

    }

    //private function verificarToken(string $idUsuario, string $tkRef) {
    //    $sql = "SELECT rol FROM usuarios WHERE cedula = :cedula AND tkRef = :tkRef";
    //    $con = $this->container->get('conexion');
    //    $query = $con->prepare($sql);
    //    $query->execute(['cedula' => $idUsuario, 'tkRef' => $tkRef]);
    //    $datos = $query->fetchColumn();
    //    $query = null;
    //    $con = null;
    //    return $datos;
    //}        

    private function verificarToken(string $cedula, string $tkRef) {
        
        $url = "/token/verificar/$cedula";
        return $this->ejecutar($url, 'PATCH', json_encode(['tkRef' => $tkRef]));

    }
}