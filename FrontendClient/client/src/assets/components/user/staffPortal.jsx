// components/StaffPortal.jsx
import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useSocket } from '../../../context/socketContext';

// Animation for sending loader
const pulse = keyframes`
  0% { transform: scale(0.8); opacity: 0.7; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.8); opacity: 0.7; }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StaffHeader = styled.div`
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  padding: 2rem;
  border-radius: 10px 10px 0 0;
  margin: -1rem -1rem 2rem -1rem;
`;

const ResponseForm = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  animation: ${slideIn} 0.3s ease-out;
`;

const AttachmentPreview = styled.div`
  position: relative;
  display: inline-block;
  margin: 5px;
  
  img, video {
    max-width: 200px;
    border-radius: 8px;
  }
  
  .remove-btn {
    position: absolute;
    top: -5px;
    right: -5px;
    background: red;
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 12px;
    cursor: pointer;
  }
`;

const MessageBubble = styled.div`
  border-radius: 15px;
  padding: 12px 16px;
  margin: 8px 0;
  max-width: 70%;
  word-wrap: break-word;
  animation: ${slideIn} 0.3s ease-out;
  
  &.client-message {
    background: #e3f2fd;
    color: #1565c0;
    margin-left: auto;
    border-bottom-right-radius: 5px;
  }
  
  &.staff-message {
    background: #f5f5f5;
    color: #333;
    margin-right: auto;
    border-bottom-left-radius: 5px;
  }
  
  &.staff-audio {
    background: #fff3e0;
    border-left: 4px solid #ff9800;
  }
  
  &.staff-video {
    background: #e8f5e8;
    border-left: 4px solid #4caf50;
  }
  
  &.staff-image {
    background: #fce4ec;
    border-left: 4px solid #e91e63;
  }
  
  &.staff-pdf {
    background: #f3e5f5;
    border-left: 4px solid #9c27b0;
  }
`;

const AudioRecorder = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #fff;
  border: 2px dashed #ddd;
  border-radius: 8px;
  margin: 10px 0;
`;

const RecordButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: ${props => props.recording ? '#ff4444' : '#4CAF50'};
  color: white;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const AudioVisualizer = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  height: 30px;
  
  .bar {
    width: 3px;
    background: #4CAF50;
    border-radius: 2px;
    transition: height 0.1s ease;
  }
`;

const VideoRecorder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  background: #fff;
  border: 2px dashed #ddd;
  border-radius: 8px;
  margin: 10px 0;
`;

const VideoPreview = styled.video`
  max-width: 100%;
  border-radius: 8px;
  background: #000;
`;

const ResponseTypeSelector = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const ResponseTypeButton = styled.button`
  padding: 8px 16px;
  border: 2px solid ${props => props.active ? '#007bff' : '#ddd'};
  background: ${props => props.active ? '#007bff' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  
  &:hover {
    border-color: #007bff;
    color: #007bff;
  }
`;

const SendingLoader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #e3f2fd;
  border-radius: 8px;
  margin: 10px 0;
  
  .dot {
    width: 8px;
    height: 8px;
    background: #007bff;
    border-radius: 50%;
    animation: ${pulse} 1s infinite;
    
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
`;

const NotificationSound = styled.audio`
  display: none;
`;

const StaffPortal = () => {
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [response, setResponse] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [responseType, setResponseType] = useState('text'); // 'text', 'audio', 'video'
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [staff] = useState({ id: 1, name: 'Sarah Johnson' });
  const [socketConnected, setSocketConnected] = useState(false);
  
  const audioRecorderRef = useRef(null);
  const videoRecorderRef = useRef(null);
  const audioVisualizerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const notificationSoundRef = useRef(null);
  const audioChunksRef = useRef([]);
  const videoChunksRef = useRef([]);

  const socket = useSocket();

  // Fake data for demonstration
  const fakeInquiries = [
    {
      id: 1,
      subject: "Urgent: Funeral Arrangements Question",
      message: "Hello, I'm concerned about the flower arrangements for my father's service. Can we discuss alternative options?",
      status: "new",
      client_name: "Michael Johnson",
      deceased_name: "Robert Johnson",
      created_at: new Date().toISOString(),
      responses: []
    },
    {
      id: 2,
      subject: "Casket Selection Inquiry",
      message: "I'd like to see more options for oak caskets. Do you have a catalog I can review?",
      status: "responded",
      client_name: "Sarah Williams",
      deceased_name: "James Williams",
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      responses: [
        {
          id: 1,
          inquiry_id: 2,
          staff_id: 1,
          staff_name: "David Chen",
          response: "I've attached our oak casket catalog with all available options and pricing.",
          attachment_path: "/fake/path/catalog.pdf",
          attachment_type: "pdf",
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          inquiry_id: 2,
          staff_id: 1,
          staff_name: "Sarah Johnson",
          response: "Here's an audio explanation of our premium casket options:",
          attachment_path: "/fake/path/casket_audio.mp3",
          attachment_type: "audio",
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          inquiry_id: 2,
          staff_id: 1,
          staff_name: "David Chen",
          response: "And here's a video tour of our casket showroom:",
          attachment_path: "/fake/path/showroom_tour.mp4",
          attachment_type: "video",
          created_at: new Date().toISOString()
        }
      ]
    }
  ];

  useEffect(() => {
    setInquiries(fakeInquiries);

    if (socket) {
      setSocketConnected(true);
      
      const handleNewInquiry = (inquiry) => {
        setInquiries(prev => [inquiry, ...prev]);
        playNotificationSound();
      };

      socket.on('new_inquiry', handleNewInquiry);

      return () => {
        socket.off('new_inquiry', handleNewInquiry);
      };
    }
  }, [socket]);

  // Audio recording functions
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        const audioUrl = URL.createObjectURL(audioBlob);
        if (audioRecorderRef.current) {
          audioRecorderRef.current.src = audioUrl;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      startAudioVisualization(stream);
    } catch (error) {
      console.error('Error starting audio recording:', error);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      stopAudioVisualization();
    }
  };

  const startAudioVisualization = (stream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const visualize = () => {
      if (!isRecording) return;

      analyser.getByteFrequencyData(dataArray);
      
      if (audioVisualizerRef.current) {
        audioVisualizerRef.current.innerHTML = '';
        const barCount = 20;
        for (let i = 0; i < barCount; i++) {
          const bar = document.createElement('div');
          bar.className = 'bar';
          const value = dataArray[Math.floor(i * bufferLength / barCount)];
          bar.style.height = `${(value / 255) * 30}px`;
          audioVisualizerRef.current.appendChild(bar);
        }
      }

      requestAnimationFrame(visualize);
    };

    visualize();
  };

  const stopAudioVisualization = () => {
    // Visualization stops automatically when isRecording becomes false
  };

  // Video recording functions
  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];

      if (videoRecorderRef.current) {
        videoRecorderRef.current.srcObject = stream;
        videoRecorderRef.current.play();
      }

      mediaRecorder.ondataavailable = (event) => {
        videoChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/mp4' });
        setVideoBlob(videoBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting video recording:', error);
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      if (videoRecorderRef.current) {
        videoRecorderRef.current.srcObject = null;
        const videoUrl = URL.createObjectURL(new Blob(videoChunksRef.current, { type: 'video/mp4' }));
        videoRecorderRef.current.src = videoUrl;
      }
    }
  };

  const playNotificationSound = () => {
    if (notificationSoundRef.current) {
      notificationSoundRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    setIsSending(true);
    playNotificationSound();

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    let attachmentBlob = null;
    let attachmentType = 'text';

    if (responseType === 'audio' && audioBlob) {
      attachmentBlob = audioBlob;
      attachmentType = 'audio';
    } else if (responseType === 'video' && videoBlob) {
      attachmentBlob = videoBlob;
      attachmentType = 'video';
    } else if (attachment) {
      attachmentBlob = attachment;
      attachmentType = getFileType(attachment.type);
    }

    const fakeResponse = {
      id: Date.now(),
      inquiry_id: selectedInquiry.id,
      staff_id: staff.id,
      staff_name: staff.name,
      response: response || null,
      attachment_path: attachmentBlob ? `/fake/path/attachment_${Date.now()}` : null,
      attachment_type: attachmentType,
      created_at: new Date().toISOString(),
      response_type: responseType
    };

    setInquiries(prev => prev.map(inq => 
      inq.id === selectedInquiry.id 
        ? { 
            ...inq, 
            responses: [...(inq.responses || []), fakeResponse], 
            status: 'responded' 
          }
        : inq
    ));

    if (selectedInquiry.id === fakeResponse.inquiry_id) {
      setSelectedInquiry(prev => ({
        ...prev,
        responses: [...(prev.responses || []), fakeResponse],
        status: 'responded'
      }));
    }

    if (socket && socket.connected) {
      socket.emit('new_response', fakeResponse);
    }

    // Reset form
    setResponse('');
    setAttachment(null);
    setAudioBlob(null);
    setVideoBlob(null);
    setResponseType('text');
    setIsSending(false);
  };

  const getFileType = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'pdf';
    return 'document';
  };

  const renderAttachmentPreview = () => {
    if (responseType === 'audio' && audioBlob) {
      return (
        <AttachmentPreview>
          <audio ref={audioRecorderRef} controls style={{width: '100%'}} />
          <button type="button" className="remove-btn" onClick={() => setAudioBlob(null)}>×</button>
        </AttachmentPreview>
      );
    }

    if (responseType === 'video' && videoBlob) {
      return (
        <AttachmentPreview>
          <video ref={videoRecorderRef} controls style={{maxWidth: '200px'}} />
          <button type="button" className="remove-btn" onClick={() => setVideoBlob(null)}>×</button>
        </AttachmentPreview>
      );
    }

    if (attachment) {
      if (attachment.type.startsWith('image/')) {
        return (
          <AttachmentPreview>
            <img src={URL.createObjectURL(attachment)} alt="Preview" className="img-fluid" />
            <button type="button" className="remove-btn" onClick={() => setAttachment(null)}>×</button>
          </AttachmentPreview>
        );
      }
      return (
        <AttachmentPreview>
          <div className="p-2 border rounded bg-white">
            <strong>File:</strong> {attachment.name}
            <button type="button" className="remove-btn" onClick={() => setAttachment(null)}>×</button>
          </div>
        </AttachmentPreview>
      );
    }

    return null;
  };

  const renderResponseTypeSelector = () => {
    if (isRecording) return null;

    return (
      <ResponseTypeSelector>
        <ResponseTypeButton 
          type="button"
          active={responseType === 'text'}
          onClick={() => setResponseType('text')}
        >
          📝 Text
        </ResponseTypeButton>
        <ResponseTypeButton 
          type="button"
          active={responseType === 'audio'}
          onClick={() => setResponseType('audio')}
        >
          🎤 Audio
        </ResponseTypeButton>
        <ResponseTypeButton 
          type="button"
          active={responseType === 'video'}
          onClick={() => setResponseType('video')}
        >
          🎥 Video
        </ResponseTypeButton>
      </ResponseTypeSelector>
    );
  };

  const renderRecorder = () => {
    if (responseType === 'audio') {
      return (
        <AudioRecorder>
          {!isRecording ? (
            <>
              <RecordButton onClick={startAudioRecording}>
                🎤 Start Recording
              </RecordButton>
              <span>Click to record audio message</span>
            </>
          ) : (
            <>
              <RecordButton recording onClick={stopAudioRecording}>
                ⏹️ Stop Recording
              </RecordButton>
              <AudioVisualizer ref={audioVisualizerRef} />
              <span>Recording... Click stop when done</span>
            </>
          )}
        </AudioRecorder>
      );
    }

    if (responseType === 'video') {
      return (
        <VideoRecorder>
          <VideoPreview ref={videoRecorderRef} />
          {!isRecording ? (
            <RecordButton onClick={startVideoRecording}>
              🎥 Start Video Recording
            </RecordButton>
          ) : (
            <RecordButton recording onClick={stopVideoRecording}>
              ⏹️ Stop Video Recording
            </RecordButton>
          )}
        </VideoRecorder>
      );
    }

    return null;
  };

  const getMessageBubbleClass = (response) => {
    const baseClass = 'staff-message';
    const type = response.response_type || response.attachment_type;
    
    switch (type) {
      case 'audio': return `${baseClass} staff-audio`;
      case 'video': return `${baseClass} staff-video`;
      case 'image': return `${baseClass} staff-image`;
      case 'pdf': return `${baseClass} staff-pdf`;
      default: return baseClass;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getFakeFileUrl = (filePath) => {
    const filename = filePath.split('/').pop();
    switch (filename) {
      case 'catalog.pdf': return 'https://www.africau.edu/images/default/sample.pdf';
      case 'casket_audio.mp3': return 'https://sample-videos.com/audio/mp3/wave.mp3';
      case 'showroom_tour.mp4': return 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4';
      case 'flower_setup.jpg': return 'https://picsum.photos/400/300?random=1';
      default: return 'https://placehold.co/400x300/007bff/white?text=File+Preview';
    }
  };

  const renderAttachment = (response) => {
    if (!response.attachment_path) return null;

    const fileUrl = getFakeFileUrl(response.attachment_path);
    
    switch (response.attachment_type) {
      case 'image':
        return <img src={fileUrl} alt="Attachment" className="img-fluid rounded mt-2" style={{maxWidth: '300px'}} />;
      case 'video':
        return (
          <video controls className="rounded mt-2" style={{maxWidth: '300px'}}>
            <source src={fileUrl} type="video/mp4" />
          </video>
        );
      case 'audio':
        return (
          <audio controls className="w-100 mt-2">
            <source src={fileUrl} type="audio/mpeg" />
          </audio>
        );
      case 'pdf':
        return (
          <iframe src={fileUrl} width="100%" height="300px" className="border rounded mt-2" title="PDF Document" />
        );
      default:
        return <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary mt-2">Download File</a>;
    }
  };

  return (
    <div>
      <NotificationSound ref={notificationSoundRef} src="/notification-sound.mp3" preload="auto" />
      
      <StaffHeader>
        <h2>Staff Dashboard</h2>
        <p className="mb-0">Manage client inquiries with compassion and care</p>
        <small>{socketConnected ? '🔗 Real-time Mode' : '📱 Demo Mode'}</small>
      </StaffHeader>

      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Inquiries ({inquiries.length})</h5>
              <span className="badge bg-light text-dark">
                {inquiries.filter(i => i.status === 'new').length} new
              </span>
            </div>
            <div className="card-body p-0">
              <div style={{maxHeight: '600px', overflowY: 'auto'}}>
                {inquiries.map(inquiry => (
                  <div key={inquiry.id} className={`p-3 border-bottom cursor-pointer ${selectedInquiry?.id === inquiry.id ? 'bg-light' : ''} ${inquiry.status === 'new' ? 'border-start border-3 border-warning' : ''}`} onClick={() => setSelectedInquiry(inquiry)} style={{cursor: 'pointer'}}>
                    <div className="d-flex justify-content-between align-items-start">
                      <h6 className="mb-0 text-truncate" style={{maxWidth: '200px'}}>{inquiry.subject}</h6>
                      <span className={`badge ${inquiry.status === 'new' ? 'bg-warning' : inquiry.status === 'responded' ? 'bg-success' : inquiry.status === 'in_progress' ? 'bg-info' : 'bg-secondary'}`}>
                        {inquiry.status}
                      </span>
                    </div>
                    <p className="text-muted mb-1 small">From: {inquiry.client_name}</p>
                    <p className="text-muted mb-0 small">Regarding: {inquiry.deceased_name}</p>
                    <small className="text-muted">{formatDate(inquiry.created_at)}</small>
                    {inquiry.responses && inquiry.responses.length > 0 && (
                      <small className="d-block text-primary">{inquiry.responses.length} response(s)</small>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          {selectedInquiry ? (
            <div className="card">
              <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">{selectedInquiry.subject}</h5>
                  <small className="text-muted">Client: {selectedInquiry.client_name} • Regarding: {selectedInquiry.deceased_name}</small>
                </div>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedInquiry(null)}>Close</button>
              </div>
              <div className="card-body">
                <div className="chat-container" style={{maxHeight: '400px', overflowY: 'auto', padding: '1rem'}}>
                  <MessageBubble className="client-message">
                    <p className="mb-1">{selectedInquiry.message}</p>
                    <small className="opacity-75">{selectedInquiry.client_name} • {formatDate(selectedInquiry.created_at)}</small>
                  </MessageBubble>

                  {selectedInquiry.responses?.map(response => (
                    <MessageBubble key={response.id} className={getMessageBubbleClass(response)}>
                      {response.response && <p className="mb-2">{response.response}</p>}
                      {renderAttachment(response)}
                      <small className="opacity-75 d-block mt-2">
                        {response.staff_name} • {formatDate(response.created_at)}
                        {response.attachment_type && ` • 📎 ${response.attachment_type.toUpperCase()}`}
                      </small>
                    </MessageBubble>
                  ))}

                  {isSending && (
                    <SendingLoader>
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <span>Sending response...</span>
                    </SendingLoader>
                  )}
                </div>

                <ResponseForm>
                  <form onSubmit={handleRespond}>
                    {renderResponseTypeSelector()}
                    {renderRecorder()}

                    {responseType === 'text' && (
                      <div className="mb-3">
                        <label className="form-label fw-bold">Your Response</label>
                        <textarea className="form-control" rows="3" value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Type your response here..." />
                      </div>
                    )}

                    {responseType === 'text' && (
                      <div className="mb-3">
                        <label className="form-label fw-bold">Attachment (Optional)</label>
                        <input type="file" className="form-control" onChange={(e) => setAttachment(e.target.files[0])} accept="image/*,video/*,audio/*,.pdf" />
                        <small className="text-muted">Max file size: 50MB. Supported formats: JPG, PNG, GIF, MP4, MP3, WAV, PDF</small>
                      </div>
                    )}

                    {renderAttachmentPreview()}

                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-success flex-fill" disabled={isSending || isRecording}>
                        {isSending ? '🔄 Sending...' : '📤 Send Response'}
                      </button>
                      <button type="button" className="btn btn-outline-secondary" onClick={() => { setResponse(''); setAttachment(null); setAudioBlob(null); setVideoBlob(null); setResponseType('text'); }}>
                        Clear
                      </button>
                    </div>
                  </form>
                </ResponseForm>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="text-muted mb-3"><i className="bi bi-chat-dots" style={{fontSize: '3rem'}}></i></div>
                <h5 className="text-muted">Select an inquiry to view and respond</h5>
                <p className="text-muted">Click on any inquiry from the list to start a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffPortal;