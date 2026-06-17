<?php
// Controlador de Usuario en el servicio de datos, se encarga de recibir las peticiones relacionadas con los usuarios, 
// autenticar al usuario que realiza la petición y luego realizar las operaciones necesarias en la base de datos para cumplir con la petición.
namespace App\controllers;

    use Psr\Http\Message\ResponseInterface as Response;
    use Psr\Http\Message\ServerRequestInterface as Request;
    use Psr\Container\ContainerInterface;

    use PDO;

    class Usuario extends Autenticar {

        private function editarUsuario(string $idUsuario, int $rol = -1, string $passw = "") {

            $sql = $rol == -1 ? "UPDATE Usuarios SET passw = :passw" :  "UPDATE Usuarios SET rol = :rol"; 
            $sql .= " WHERE cedula = :idUsuario;";

            $con = $this->container->get('conexion');
            $query = $con->prepare($sql);
            
            $query->bindValue(":idUsuario", $idUsuario, PDO::PARAM_STR);

            if ($passw != "") {
                $query->bindValue(":passw", $passw, PDO::PARAM_STR);
            } else {
                $query->bindValue(":rol", $rol, PDO::PARAM_INT);
            }
            $query->execute();
            $filasAfectadas = $query->rowCount();
            $query = null;
            $con = null;
            return $filasAfectadas;
        }

        public function changePassw(Request $request, Response $response, $args) {
            $body = json_decode($request->getBody());
            $status = $this->editarUsuario(idUsuario: $args['id'], passw: $body->passwN)
                == 0 ? 404 : 200;
            return $response->withStatus($status);
        }

        public function resetPassw(Request $request, Response $response, $args) {

            $passwN = json_decode($request->getBody())->passwN;
            
            $status = $this->editarUsuario(idUsuario: $args['id'], passw: $passwN)
                == 0 ? 404 : 200;
            return $response->withStatus($status);            
        }
        public function changeRol(Request $request, Response $response, $args) {
            $body = json_decode($request->getBody());
            $status = $this->editarUsuario(idUsuario: $args['id'], rol: $body->rol)
                == 0 ? 404 : 200;
            return $response->withStatus($status);             
        }
        public function buscar(Request $request, Response $response, $args) {
            $id = $args['id'];
            $sql = "SELECT * FROM Usuarios WHERE cedula = :id";
            // Solamente se devuelve ultimo_acceso, id_Usuario, rol y cedula del usuario, no se devuelve la contraseña
            $con = $this->container->get('conexion');
            $query = $con->prepare($sql);
            $query->execute(['id' => $id]);
            $res = $query->fetch();
            //$res = $query->fetch(PDO::FETCH_ASSOC);
            $status = $query->rowCount() > 0 ? 200 : 404;
            $query = null;
            $con = null;

            $response->getBody()->write(json_encode($res));            
            return $response
                ->withHeader('Content-type', 'Application/json')
                ->withStatus($status);
        }
    }