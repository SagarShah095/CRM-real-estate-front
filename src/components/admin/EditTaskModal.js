"use client";

import CreateTaskModal from "./CreateTaskModal";

/**
 * EditTaskModal
 * Manages the edit task workflow by delegating directly to CreateTaskModal
 * in edit mode ("edit"), ensuring unified state, consistent schema validation,
 * and calling the PATCH /tasks/${id} API endpoint.
 */
export default function EditTaskModal({
  isOpen,
  onClose,
  task,
  onTaskUpdated,
  onError,
  projectOptions,
  userOptions,
}) {
  return (
    <CreateTaskModal
      isOpen={isOpen}
      onClose={onClose}
      task={task}
      mode="edit"
      onTaskUpdated={onTaskUpdated}
      onError={onError}
      projectOptions={projectOptions}
      userOptions={userOptions}
    />
  );
}
