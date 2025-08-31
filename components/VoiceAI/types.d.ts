declare module './VoiceAIShared' {
  export interface StatusBadgeProps {
    status: string;
  }

  export const StatusBadge: React.FC<StatusBadgeProps>;

  export interface QualificationBadgeProps {
    qualified: boolean;
  }

  export const QualificationBadge: React.FC<QualificationBadgeProps>;
}

declare module './CallDetailsModal' {
  export interface CallDetailsModalProps {
    callId: string | null;
    isOpen: boolean;
    onClose: () => void;
  }

  const CallDetailsModal: React.FC<CallDetailsModalProps>;
  export default CallDetailsModal;
}
