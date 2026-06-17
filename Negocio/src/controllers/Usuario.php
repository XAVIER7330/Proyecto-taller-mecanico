<?php
// Controlador de Usuario en el servicio de negocio, se encarga de recibir las peticiones relacionadas con los usuarios, 
// autenticar al usuario que realiza la petición y luego delegar la tarea al servicio de datos a través de solicitudes HTTP usando CURL.
namespace App\controllers;

    use Psr\Http\Message\ResponseInterface as Response;
    use Psr\Http\Message\ServerRequestInterface as Request;
    use Psr\Container\ContainerInterface;

    use PDO;

    class Usuario extends ServicioCURL {
        use Autenticar;
        const ENDPOINT = "/usuario";

        public function changePassw(Request $request, Response $response, $args) {
            $body = json_decode($request->getBody());
            if($datos = $this->autenticar($args['id'], $body->passw)) {


                $passwN = password_hash($body->passwN, PASSWORD_BCRYPT, ["cost" => 10]);
                $data = $this->ejecutar(
                    self::ENDPOINT . '/passw/' . $args['id'],
                    'PATCH',
                    json_encode(['cedula' => $args['id'], 'passwN' => $passwN])
                );


                $status = $data['status'];
            } else {
                $status = 401;
            }
            return $response->withStatus($status);
        }
        
        public function resetPassw(Request $request, Response $response, $args) {
            //En este punto se puede generar un nuevo password aleatorio y enviarlo por correo al usuario, 
            // pero por simplicidad se va a usar la cédula como nueva contraseña
            // $passwN = bin2hex(random_bytes(4)); // Genera una contraseña aleatoria de 8 caracteres hexadecimales
            
            $passwN = password_hash($args['id'], PASSWORD_BCRYPT, ["cost" => 10]);

            $data = $this->ejecutar(self::ENDPOINT . '/passw/reset/' . $args['id'], 'PATCH', json_encode(['passwN' => $passwN]));
            //Se envía la nueva contraseña por correo al usuario despues de ejecutar el reseteo 
            
            return $response->withStatus($data['status']);            
        }
        public function changeRol(Request $request, Response $response, $args) {
            $body = json_decode($request->getBody());
            $data = $this->ejecutar(self::ENDPOINT . '/rol/' . $args['id'], 'PATCH', json_encode(['cedula' => $args['id'], 'rol' => $body->rol]));
            return $response->withStatus($data['status']);               
        }
        public function buscar(Request $request, Response $response, $args) {

           $body = json_decode($request->getBody());
              $data = $this->ejecutar(self::ENDPOINT . '/' . $args['id'], 'GET');
           if ($data['status'] != 200) {
                $data['body'] = json_encode(["error" => "Usuario no encontrado"]);
           }
           $response->getBody()->write($data['body']);
           return $response->withHeader('Content-type', 'Application/json')
                            ->withStatus($data['status']); 
        }
    }