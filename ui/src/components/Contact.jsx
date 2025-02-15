import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { post_contact } from '../data/managers/contact';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {status, msg} = await post_contact(formData);
    if(status){
      alert('Message sent successfully');
      setFormData({
      name: '',
      email: '',
      message: ''
      });
    }
    else{
      alert(msg);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-6 pt-8 md:pt-16 md:px-16">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Column - Heading */}
          <div>
            <h1 className="text-5xl md:text-6xl font-semibold mb-6">
              Get in touch with{' '}
              <span className="bg-gradient-to-r from-[#FFF3DB] to-[#FFDA8F] text-transparent bg-clip-text">the Formitive team</span>
            </h1>
          </div>

          {/* Right Column - Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-[#222] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFDA8F]"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-[#222] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFDA8F]"
                  required
                />
              </div>
              <div>
                <textarea
                  name="message"
                  placeholder="Your message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg bg-[#222] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFDA8F] resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#FFDA8F] text-black font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Send message
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 md:px-16 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileText className="w-6 h-6" />
          <span className="text-lg font-medium">Formitive</span>
        </div>
        <span className="text-gray-400">© Formitive 2025</span>
      </footer>
    </div>
  );
};

export default Contact
