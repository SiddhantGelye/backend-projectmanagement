export const UserRolesEnum  = {
    ADMIN: "admin",     
    USER: "user",
    MANAGER: "manager",
    DEVELOPER: "developer",
    TESTER: "tester",
    PROJECT_ADMIN: "project_admin",
}

export const AvailableUserRoles = Object.values(UserRolesEnum); 

export const TaskStatusEnum = {
    TODO: "todo",
    IN_PROGRESS: "in_progress",
    DONE: "done",
}


export const availableTaskStatus = Object.values(TaskStatusEnum);

console.log(AvailableUserRoles);    
console.log(availableTaskStatus); 