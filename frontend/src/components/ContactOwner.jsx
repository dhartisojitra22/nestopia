import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEnvelope, FaReply, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, replied, pending
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/contact/messages");
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error('Failed to load messages');
      setMessages([]);
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
        fetchMessages();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to send reply. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/contact/messages/${id}`);
      toast.success('Message deleted successfully');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filter === 'all' || 
      (filter === 'replied' && msg.replied) || 
      (filter === 'pending' && !msg.replied);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <FaEnvelope className="me-2" />
          Contact Messages
        </h2>
        <div className="d-flex gap-3">
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
          <select
            className="form-select"
            style={{ maxWidth: "150px" }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Messages</option>
            <option value="replied">Replied</option>
            <option value="pending">Pending</option>
          </select>
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
                  <p className="text-muted">Try adjusting your search or filter</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>From</th>
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
                          <td>{msg.name}</td>
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
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => setSelectedMessage(msg)}
                                title="View Details"
                              >
                                <FaEnvelope />
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteMessage(msg._id)}
                                title="Delete Message"
                              >
                                <FaTrash />
                              </button>
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

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Message Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedMessage(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-4">
                  <h6>From: {selectedMessage.name}</h6>
                  <p className="text-muted mb-1">Email: {selectedMessage.email}</p>
                  <p className="text-muted">
                    Date: {new Date(selectedMessage.date).toLocaleString()}
                  </p>
                </div>
                <div className="mb-4">
                  <h6>Message:</h6>
                  <p className="bg-light p-3 rounded">{selectedMessage.message}</p>
                </div>
                {selectedMessage.replied ? (
                  <div className="mb-4">
                    <h6>Your Reply:</h6>
                    <p className="bg-light p-3 rounded">{selectedMessage.reply}</p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <h6>Reply:</h6>
                    <textarea
                      className="form-control mb-2"
                      rows="4"
                      placeholder="Type your reply here..."
                      value={replyText[selectedMessage._id] || ''}
                      onChange={(e) => handleReplyChange(selectedMessage._id, e.target.value)}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSendReply(selectedMessage._id)}
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
      )}
    </div>
  );
};

export default AdminMessages;