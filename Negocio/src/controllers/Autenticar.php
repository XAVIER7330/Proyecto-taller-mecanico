<?php
namespace App\controllers;

trait Autenticar{
    protected function autenticar(string $idUsuario, string $passw, bool $verificar = false){
        
        $body = $this->ejecutar("/auth","PATCH",json_encode(["cedula"=>$idUsuario,"passw"=>$passw]));
        if ($body["status"] != 200) {
            return false;
        }

        $datos = json_decode($body["body"]);

        if (!isset($datos->cedula) || !isset($datos->rol)) {
            return false;
        }

        return $datos;
    }
}