
import React, { useState } from 'react';
import { FolderPlus, Upload, Folder, File, Download } from 'lucide-react';

const CompanyLibrary = () => {
  const [folders] = useState([
    { name: 'Hàng Nhập', files: ['Import_Checklist.pdf', 'Manifest_Template.xlsx'] },
    { name: 'Hàng Xuất', files: ['Export_Process.doc', 'SI_Template.pdf'] },
    { name: 'Hợp đồng & Biểu mẫu', files: ['Contract_2024.docx', 'Power_of_Attorney.pdf'] }
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Thư viện mẫu chuẩn</h3>
        <div className="flex space-x-3">
           <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-gray-50 transition">
            <FolderPlus size={16} className="mr-2" /> Thêm thư mục
          </button>
          <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-primaryDark transition">
            <Upload size={16} className="mr-2" /> Tải lên tài liệu
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map((folder, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
            <div className="p-5 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Folder className="text-primary fill-primary/10" size={24} />
                <span className="font-bold text-gray-800">{folder.name}</span>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {folder.files.map((file, fidx) => (
                <div key={fidx} className="flex items-center justify-between p-2 hover:bg-orange-50 rounded group/file cursor-pointer transition">
                  <div className="flex items-center space-x-3">
                    <File className="text-gray-400 group-hover/file:text-primary transition-colors" size={16} />
                    <span className="text-sm text-gray-600 font-medium">{file}</span>
                  </div>
                  <Download size={14} className="text-gray-300 group-hover/file:text-primary opacity-0 group-hover/file:opacity-100 transition-all" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyLibrary;
