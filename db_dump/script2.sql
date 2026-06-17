DELIMITER $$

CREATE PROCEDURE sp_RegistrarEntrada(
    IN p_placa VARCHAR(15),
    IN p_id_mecanico INT
)
BEGIN
    DECLARE v_id_vehiculo INT;
    
    -- Buscar el ID del vehículo por la placa
    SELECT id_vehiculo INTO v_id_vehiculo FROM Vehiculos WHERE placa = p_placa;
    
    IF v_id_vehiculo IS NOT NULL THEN
        INSERT INTO OrdenesReparacion (id_vehiculo, id_mecanico, estado)
        VALUES (v_id_vehiculo, p_id_mecanico, 'INGRESADO');
        
        SELECT LAST_INSERT_ID() AS nueva_orden_id;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Vehículo no encontrado. Registrar cliente y vehículo primero.';
    END IF;
END $$

CREATE PROCEDURE sp_RegistrarDiagnostico(
    IN p_id_orden INT,
    IN p_descripcion TEXT,
    IN p_presupuesto DECIMAL(12, 2)
)
BEGIN
    -- Insertar el diagnóstico técnico
    INSERT INTO Diagnosticos (id_orden, descripcion, presupuesto_estimado)
    VALUES (p_id_orden, p_descripcion, p_presupuesto);
    
    -- Actualizar el estado de la orden y el costo total tentativo
    UPDATE OrdenesReparacion 
    SET estado = 'ESPERANDO_APROBACION', 
        costo_total = p_presupuesto
    WHERE id_orden = p_id_orden;
END $$


CREATE PROCEDURE sp_AprobarPresupuesto(
    IN p_id_orden INT
)
BEGIN
    -- Validar que la orden esté en el estado correcto para ser aprobada
    IF (SELECT estado FROM OrdenesReparacion WHERE id_orden = p_id_orden) = 'ESPERANDO_APROBACION' THEN
        UPDATE OrdenesReparacion 
        SET estado = 'EN_REPARACION' 
        WHERE id_orden = p_id_orden;
        
        SELECT 'Presupuesto aprobado. Reparación en curso.' AS mensaje;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La orden no está pendiente de aprobación.';
    END IF;
END $$


CREATE PROCEDURE sp_ConsultarEstadoCliente(
    IN p_placa VARCHAR(15)
)
BEGIN
    SELECT 
        V.placa, 
        V.marca, 
        V.modelo, 
        O.estado AS estado_actual,
        O.fecha_entrada,
        D.descripcion AS detalle_diagnostico,
        O.costo_total
    FROM Vehiculos V
    JOIN OrdenesReparacion O ON V.id_vehiculo = O.id_vehiculo
    LEFT JOIN Diagnosticos D ON O.id_orden = D.id_orden
    WHERE V.placa = p_placa
    ORDER BY O.fecha_entrada DESC
    LIMIT 1;
END $$

DELIMITER ;