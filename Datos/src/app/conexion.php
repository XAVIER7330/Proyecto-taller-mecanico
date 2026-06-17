<?php
use psr\container\ContainerInterface;

$container->set('conexion', function(ContainerInterface $c) {
    $conf = $c->get('config_db');
    
    $opc = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
       
    ];
$dsn = "mysql:host={$conf->host};dbname={$conf->database};charset={$conf->charset}";

    try {
        $conexion = new PDO($dsn, $conf->user, $conf->password, $opc);
       // die("conexion exitosa");
        return $conexion;
    } catch (PDOException $e) {
        die("Error de conexión: " . $e->getMessage());
    }

});

