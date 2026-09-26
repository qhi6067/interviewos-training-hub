// TaskController.java · Java 21 with Spring Boot (Spring Web)
package com.example.tasks;

import java.net.URI;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    public static class Task {
        public int id;
        public String title;
        public boolean done;
        Task(int id, String title) { this.id = id; this.title = title; }
    }
    public record NewTask(String title) {}
    public record TaskPatch(Boolean done) {}

    private final List<Task> tasks = new CopyOnWriteArrayList<>(List.of(new Task(1, "Practice REST requests")));
    private final AtomicInteger nextId = new AtomicInteger(2);

    private Task find(int id) {
        return tasks.stream().filter(task -> task.id == id).findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    }

    @GetMapping
    public List<Task> list() { return tasks; }

    @GetMapping("/{id}")
    public Task get(@PathVariable int id) { return find(id); }

    @PostMapping
    public ResponseEntity<Task> create(@RequestBody NewTask body) {
        String title = body.title() == null ? "" : body.title().trim();
        if (title.isEmpty() || body.title().length() > 120) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title must be 1-120 characters");
        }
        Task task = new Task(nextId.getAndIncrement(), title);
        tasks.add(task);
        return ResponseEntity.created(URI.create("/api/tasks/" + task.id)).body(task);
    }

    @PatchMapping("/{id}")
    public Task update(@PathVariable int id, @RequestBody TaskPatch body) {
        Task task = find(id);
        if (body.done() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "done must be true or false");
        }
        task.done = body.done();
        return task;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        tasks.remove(find(id));
        return ResponseEntity.noContent().build();
    }
}
