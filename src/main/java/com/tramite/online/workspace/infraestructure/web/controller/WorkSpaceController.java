package com.tramite.online.workspace.infraestructure.web.controller;


import com.tramite.online.workspace.application.dto.command.*;
import com.tramite.online.workspace.application.dto.response.WorkSpaceResponse;
import com.tramite.online.workspace.application.usecases.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 *Controlador REST para gestionar WorkSpaces
 * @author dgarcia
 * @version 1.0
 * @since   22/11/2025
 */

@RestController
@RequestMapping("/api/v1/workspaces")
public class WorkSpaceController {


    private final Logger logger =
            LoggerFactory.getLogger(WorkSpaceController.class);

    private final CreateWorkSpaceUseCase createWorkSpaceUseCase;
    private final GetWorkSpaceByIdUseCase
            getWorkSpaceByIdUseCase;
    private final DeleteWorkSpaceUseCase deleteWorkSpaceUseCase;
    private final UpdateWorkSpaceUseCase updateWorkSpaceUseCase;
    private final ArchiveWorkSpaceUseCase
            archiveWorkSpaceUseCase;
    private final ListWorkSpacesByOwnerUseCase
            listWorkSpacesByOwnerUseCase;

    public WorkSpaceController(CreateWorkSpaceUseCase
                                       createWorkSpaceUseCase,
                               GetWorkSpaceByIdUseCase
                                       getWorkSpaceByIdUseCase,
                               DeleteWorkSpaceUseCase
                                       deleteWorkSpaceUseCase,
                               UpdateWorkSpaceUseCase
                                       updateWorkSpaceUseCase,
                               ArchiveWorkSpaceUseCase
                                       archiveWorkSpaceUseCase,
                               ListWorkSpacesByOwnerUseCase
                                       listWorkSpacesByOwnerUseCase) {
        this.createWorkSpaceUseCase = createWorkSpaceUseCase;
        this.getWorkSpaceByIdUseCase = getWorkSpaceByIdUseCase;
        this.deleteWorkSpaceUseCase = deleteWorkSpaceUseCase;
        this.updateWorkSpaceUseCase = updateWorkSpaceUseCase;
        this.archiveWorkSpaceUseCase = archiveWorkSpaceUseCase;
        this.listWorkSpacesByOwnerUseCase =
                listWorkSpacesByOwnerUseCase;
    }


    @PostMapping
    public ResponseEntity<WorkSpaceResponse> saveWorkSpace(@Valid  CreateWorkSpaceCommand command) {
        logger.info("Save workspace command: " + command);
        WorkSpaceResponse response = createWorkSpaceUseCase.createWorkSpace(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkSpaceResponse>
    getWorkSpace(@PathVariable Long id) {
        logger.info("Get workspace by id: {}", id);
        GetWorkSpaceByIdCommand command = new
                GetWorkSpaceByIdCommand(id);
        WorkSpaceResponse response =
                getWorkSpaceByIdUseCase.execute(command);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkSpaceResponse> updateWorkSpace(
            @PathVariable Long id,
            @Valid @RequestBody UpdateWorkSpaceCommand command) {
        logger.info("Update workspace with id: {}", id);
        UpdateWorkSpaceCommand commandWithId = new
                UpdateWorkSpaceCommand(
                id,
                command.name(),
                command.description(),
                command.ownerId()
        );
        WorkSpaceResponse response =
                updateWorkSpaceUseCase.update(id,commandWithId);
        return ResponseEntity.ok(response);
    }





}
