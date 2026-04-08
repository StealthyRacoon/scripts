import { Modal } from "antd";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  content = "This action cannot be undone.",
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  loading = false,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={confirmText}
      cancelText={cancelText}
      okButtonProps={{ danger, loading }}
    >
      {content}
    </Modal>
  );
}