const BADGES = {
  amateur:    { label: 'Amateur',     bg: 'rgba(91,76,245,.1)',  color: '#5B4CF5', icon: '📷' },
  pro:        { label: 'Pro',         bg: 'rgba(217,119,6,.1)',  color: '#d97706', icon: '⭐' },
  pro_offres: { label: 'Pro • Dispo', bg: 'rgba(5,150,105,.1)', color: '#059669', icon: '✅' },
};

export default function UserBadge({ badge, size = 'sm' }) {
  if (!badge || !BADGES[badge]) return null;
  const { label, bg, color, icon } = BADGES[badge];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: size === 'sm' ? '2px 8px' : '4px 12px',
      borderRadius: '9999px',
      background: bg, color,
      fontSize: size === 'sm' ? '.75rem' : '.875rem',
      fontWeight: 600,
      border: `1px solid ${color}33`,
      flexShrink: 0,
      whiteSpace: 'nowrap',
    }}>
      {icon} {label}
    </span>
  );
}
