"use client";

import CreateLeadModal from "./CreateLeadModal";

/**
 * EditLeadModal
 * Manages the edit lead workflow by delegating directly to CreateLeadModal
 * in edit mode ("edit"), ensuring unified state, consistent schema validation,
 * and calling only the single PUT /api/v1/leads/:id API endpoint.
 */
export default function EditLeadModal({
  isOpen,
  onClose,
  lead,
  onLeadUpdated,
}) {
  return (
    <CreateLeadModal
      isOpen={isOpen}
      onClose={onClose}
      lead={lead}
      mode="edit"
      onLeadUpdated={onLeadUpdated}
    />
  );
}
