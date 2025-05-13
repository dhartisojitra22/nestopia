import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEnvelope, FaSearch, FaTrash } from 'react-icons/fa';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/contact/messages");
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error('Failed to load messages');
      setMessages([]); // Set empty array on error
    }
  };

  const handleReplyChange = (id, value) => {
    setReplyText((prev) => ({ ...prev, [id]: value }));
  };

  const handleSendReply = async (id) => {
    if (!replyText[id]) return toast.warning('Reply cannot be empty');

    try {
      setLoading(true);
      const response = await axios.post(`http://localhost:3001/api/contact/reply/${id}`, {
        replyMessage: replyText[id],
      });
      
      if (response.data.message) {
        toast.success(response.data.message);
        setReplyText((prev) => ({ ...prev, [id]: '' }));
        fetchMessages(); // Refresh to show updated reply status
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to send reply. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(`http://localhost:3001/api/contact/messages/${id}`);
      
      if (response.data.message) {
        toast.success(response.data.message);
        fetchMessages(); // Refresh the messages list
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete message. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <FaEnvelope className="me-2" />
          Contact Messages
        </h2>
        <div className="input-group" style={{ maxWidth: "300px" }}>
          <span className="input-group-text">
            <FaSearch />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-5">
                  <FaEnvelope size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No messages found</h5>
                  <p className="text-muted">Try adjusting your search</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Email</th>
                        <th>Message</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMessages.map((msg) => (
                        <tr key={msg._id}>
                          <td>{msg.email}</td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: "200px" }}>
                              {msg.message}
                            </div>
                          </td>
                          <td>{new Date(msg.date).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${msg.replied ? 'bg-success' : 'bg-warning'}`}>
                              {msg.replied ? 'Replied' : 'Pending'}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group">
                              <button
                                className="btn btn-sm btn-primary me-2"
                                data-bs-toggle="modal"
                                data-bs-target={`#messageModal${msg._id}`}
                              >
                                <FaEnvelope />
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(msg._id)}
                                disabled={loading}
                              >
                                <FaTrash />
                              </button>
                            </div>

                            {/* Message Modal */}
                            <div className="modal fade" id={`messageModal${msg._id}`} tabIndex="-1">
                              <div className="modal-dialog modal-lg">
                                <div className="modal-content">
                                  <div className="modal-header">
                                    <h5 className="modal-title">Message Details</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                                  </div>
                                  <div className="modal-body">
                                    <div className="mb-4">
                                      <h6>From:</h6>
                                      <p className="text-muted">{msg.email}</p>
                                      <p className="text-muted">
                                        Date: {new Date(msg.date).toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="mb-4">
                                      <h6>Message:</h6>
                                      <p className="bg-light p-3 rounded">{msg.message}</p>
                                    </div>
                                    {msg.replied ? (
                                      <div className="mb-4">
                                        <h6>Your Reply:</h6>
                                        <p className="bg-light p-3 rounded">{msg.reply}</p>
                                      </div>
                                    ) : (
                                      <div className="mb-4">
                                        <h6>Reply:</h6>
                                        <textarea
                                          className="form-control mb-2"
                                          rows="4"
                                          placeholder="Type your reply here..."
                                          value={replyText[msg._id] || ''}
                                          onChange={(e) => handleReplyChange(msg._id, e.target.value)}
                                        />
                                        <button
                                          className="btn btn-primary"
                                          onClick={() => handleSendReply(msg._id)}
                                          disabled={loading}
                                        >
                                          {loading ? 'Sending...' : 'Send Reply'}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
