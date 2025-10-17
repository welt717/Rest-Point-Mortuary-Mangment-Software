import React from 'react';

const PostmortemModal = ({ isOpen, onClose, postmortem }) => {
  if (!isOpen || !postmortem) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          width: '100%',
          maxWidth: '600px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            borderBottom: '1px solid #eee',
            paddingBottom: '0.5rem',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.3rem',
              fontWeight: 600,
              color: '#222',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            🧫 Postmortem Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.3rem',
              cursor: 'pointer',
              color: '#888',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {postmortem ? (
          <div style={{ lineHeight: 1.6 }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#555' }}>👨‍⚕️ Doctor: </strong>
              <span style={{ color: '#000' }}>{postmortem.doctor_name || 'N/A'}</span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#555' }}>📅 Date: </strong>
              <span style={{ color: '#000' }}>
                {postmortem.date
                  ? new Date(postmortem.date).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>

            <div>
              <strong style={{ color: '#555' }}>📄 Findings: </strong>
              <p
                style={{
                  background: '#f7f7f7',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  color: '#333',
                  marginTop: '0.5rem',
                  whiteSpace: 'pre-line',
                }}
              >
                {postmortem.findings || 'N/A'}
              </p>
            </div>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#777', marginTop: '1rem' }}>
            No postmortem information available.
          </p>
        )}
      </div>
    </div>
  );
};

export default PostmortemModal;
