import { useState, useMemo } from 'react';
import Description from "../components/Description"; 


// Field configuration - Add new fields here to automatically include them
const fieldConfigs = [
  {
    key: 'name',
    label: 'Name',
    icon: '👤',
    generate: () => {
      const firstNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Neha', 'Raj', 'Pooja', 'Suresh', 'Anita', 'David', 'Emma', 'John', 'Sophia', 'Michael'];
      const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Mehta', 'Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Davis'];
      return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    }
  },
  {
    key: 'email',
    label: 'Email',
    icon: '✉️',
    generate: () => {
      const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'example.com', 'testmail.com', 'company.org'];
      const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
      let email = '';
      for (let i = 0; i < 8 + Math.floor(Math.random() * 5); i++) {
        email += chars[Math.floor(Math.random() * chars.length)];
      }
      return email + '@' + domains[Math.floor(Math.random() * domains.length)];
    }
  },
  {
    key: 'phone',
    label: 'Phone Number',
    icon: '📱',
    generate: () => {
      const formats = ['+91-987-654-3210', '+1-(555)-123-4567', '+44-20-1234-5678', '+61-412-345-678'];
      let phone = formats[Math.floor(Math.random() * formats.length)];
      phone = phone.replace(/\d/g, () => Math.floor(Math.random() * 10).toString());
      return phone;
    }
  },
  {
    key: 'password',
    label: 'Password',
    icon: '🔒',
    generate: () => {
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const numbers = '0123456789';
      const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      let password = uppercase[Math.floor(Math.random() * uppercase.length)];
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
      password += numbers[Math.floor(Math.random() * numbers.length)];
      password += special[Math.floor(Math.random() * special.length)];
      const allChars = uppercase + lowercase + numbers + special;
      for (let i = 0; i < 6 + Math.floor(Math.random() * 4); i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
      }
      return password.split('').sort(() => 0.5 - Math.random()).join('');
    }
  },
  {
    key: 'address',
    label: 'Address',
    icon: '🏠',
    generate: () => {
      const streets = ['Main Street', 'Park Avenue', 'MG Road', 'High Street', 'Church Street', 'Lake Road', 'Hill View', 'Sunset Boulevard', 'Green Lane', 'Ocean Drive'];
      const cities = ['Mumbai', 'Delhi', 'Bangalore', 'New York', 'London', 'Sydney', 'Tokyo', 'Paris', 'Dubai', 'Singapore'];
      const zipCodes = ['100001', '400001', '560001', 'SW1A 1AA', '10001', '2000', '75001'];
      return `${Math.floor(Math.random() * 999) + 1}, ${streets[Math.floor(Math.random() * streets.length)]}, ${cities[Math.floor(Math.random() * cities.length)]} - ${zipCodes[Math.floor(Math.random() * zipCodes.length)]}`;
    }
  },
  {
    key: 'ipAddress',
    label: 'IP Address',
    icon: '🌐',
    generate: () => {
      return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
    }
  },
  {
    key: 'country',
    label: 'Country',
    icon: '🌍',
    generate: () => {
      const countries = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'China', 'Brazil', 'Mexico', 'Spain', 'Italy', 'Netherlands', 'Singapore', 'United Arab Emirates', 'South Africa', 'South Korea'];
      return countries[Math.floor(Math.random() * countries.length)];
    }
  },
  {
    key: 'gender',
    label: 'Gender',
    icon: '⚧️',
    generate: () => {
      const genders = ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'];
      return genders[Math.floor(Math.random() * genders.length)];
    }
  },
  {
    key: 'age',
    label: 'Age',
    icon: '🎂',
    generate: () => Math.floor(Math.random() * 70) + 18
  },
  {
    key: 'jobTitle',
    label: 'Job Title',
    icon: '💼',
    generate: () => {
      const titles = ['Software Engineer', 'Data Analyst', 'Product Manager', 'UX Designer', 'Marketing Specialist', 'Sales Manager', 'HR Executive', 'Financial Analyst', 'Project Manager', 'Content Writer', 'Graphic Designer', 'DevOps Engineer'];
      return titles[Math.floor(Math.random() * titles.length)];
    }
  },
  {
    key: 'company',
    label: 'Company',
    icon: '🏢',
    generate: () => {
      const prefixes = ['Tech', 'Global', 'Innovative', 'Creative', 'Digital', 'Future', 'Smart', 'NextGen'];
      const suffixes = ['Solutions', 'Systems', 'Labs', 'Industries', 'Enterprises', 'Corporation', 'Technologies', 'Group'];
      return prefixes[Math.floor(Math.random() * prefixes.length)] + ' ' + suffixes[Math.floor(Math.random() * suffixes.length)];
    }
  }
];

export default function ToolHome(){
  const [selectedFields, setSelectedFields] = useState(fieldConfigs.map(f => f.key));
  const [recordCount, setRecordCount] = useState(5);
  const [generatedData, setGeneratedData] = useState([]);
  const [copied, setCopied] = useState(false);

  const toggleField = (key) => {
    setSelectedFields(prev => 
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    );
  };

  const selectAll = () => setSelectedFields(fieldConfigs.map(f => f.key));
  const clearAll = () => setSelectedFields([]);

  const generateData = () => {
    const data = [];
    for (let i = 0; i < recordCount; i++) {
      const record = { id: i + 1 };
      selectedFields.forEach(key => {
        const fieldConfig = fieldConfigs.find(f => f.key === key);
        if (fieldConfig) {
          record[key] = fieldConfig.generate();
        }
      });
      data.push(record);
    }
    setGeneratedData(data);
  };

  const exportToJson = () => {
    const dataStr = JSON.stringify(generatedData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fake-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const dataStr = JSON.stringify(generatedData, null, 2);
    navigator.clipboard.writeText(dataStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const copyTableData = () => {
    if (generatedData.length === 0) return;
    const headers = ['ID', ...selectedFields.map(key => fieldConfigs.find(f => f.key === key)?.label || key)];
    const rows = generatedData.map(record => 
      [record.id, ...selectedFields.map(key => record[key])].join('\t')
    );
    const tsv = [headers.join('\t'), ...rows].join('\n');
    navigator.clipboard.writeText(tsv).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const visibleFields = useMemo(() => 
    fieldConfigs.filter(f => selectedFields.includes(f.key)), 
    [selectedFields]
  );

  return (
    <div className="min-h-screen bg-(--card) text-(--foreground) p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="heading text-center animate-fade-up mt-5 mb-2">
           Fake Data Generator
          </h1>
          <p className="description text-center animate-fade-up pt-2">Generate realistic fake data for testing and development</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         
          <div className="lg:col-span-1 bg-(--card) border border-(--border) rounded-xl shadow-md p-6 h-fit ">
            <div className="flex items-center justify-between mb-4">
              <h2 className="subheading flex items-center gap-2">
                <span>📋</span> Select Fields
              </h2>
            </div>
            <div className="flex gap-2 mb-4">
              <button 
                onClick={selectAll}
                className="flex-1 px-3 py-1.5 text-sm bg-(--primary) text-white rounded-lg  font-semibold cursor-pointer"
              >
                Select All
              </button>
              <button 
                onClick={clearAll}
                className="flex-1 px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg font-semibold transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {fieldConfigs.map((field) => (
                <label 
                  key={field.key} 
                  className="flex items-center gap-3 p-3 rounded-lg  cursor-pointer border border-transparent  transition-all"
                >
                  <input 
                    type="checkbox"
                    checked={selectedFields.includes(field.key)}
                    onChange={() => toggleField(field.key)}
                    className="w-5 h-5 rounded border-(--border) text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xl">{field.icon}</span>
                  <span className="text-(--muted-foreground) font-medium">{field.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Right Panel - Data Generation & Display */}
          <div className="lg:col-span-3 space-y-6">
            {/* Controls */}
            <div className="bg-(--card) border border-(--border) rounded-xl shadow-md p-6">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <label className="block content mb-2">
                    Number of Records to Generate
                  </label>
                  <input 
                    type="number"
                    min="1"
                    max="500"
                    value={recordCount}
                    onChange={(e) => setRecordCount(Math.min(500, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-full md:w-40 px-4 py-3 border-2 border-(--border) rounded-lg  text-lg "
                  />
                </div>
                <button 
                  onClick={generateData}
                  disabled={selectedFields.length === 0}
                  className="w-full md:w-auto px-8 py-3 bg-(--primary) text-white font-semibold rounded-lg  disabled:bg-blue-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg cursor-pointer"
                >
                   Generate Data
                </button>
              </div>

              {selectedFields.length === 0 && (
                <p className="text-amber-600 mt-3 flex items-center gap-2">
                  <span>⚠️</span> Please select at least one field to generate data
                </p>
              )}
            </div>

            {/* Action Buttons */}
            {generatedData.length > 0 && (
              <div className="bg-(--card) border border-(--border) rounded-xl shadow-md p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                      <span>✅</span> {generatedData.length} records generated
                    </div>
                    <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium">
                      {visibleFields.length} fields
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={copyTableData}
                      className="px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center cursor-pointer  gap-2"
                    >
                      <span>📋</span> Copy Table
                    </button>
                    <button 
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span>📋</span> Copy JSON
                    </button>
                    <button 
                      onClick={exportToJson}
                      className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center cursor-pointer gap-2"
                    >
                      <span>⬇️</span> Export JSON
                    </button>
                  </div>
                </div>
                {copied && (
                  <div className="mt-3 text-green-600 font-medium flex items-center gap-2">
                    <span>✓</span> Data copied to clipboard!
                  </div>
                )}
              </div>
            )}

            {/* Data Table */}
            {generatedData.length > 0 && (
              <div className="bg-(--card) border border-(--border) rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-(--card)">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold text-(--muted-foreground) uppercase tracking-wider border-b-2 border-(--border) w-16">
                          #
                        </th>
                        {visibleFields.map((field) => (
                          <th key={field.key} className="px-4 py-4 text-left text-xs font-bold text-(--muted-foreground) uppercase tracking-wider border-b-2 border-(--border) whitespace-nowrap">
                            <span className="flex items-center gap-2">
                              {/* <span>{field.icon}</span> */}
                              {field.label}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {generatedData.map((record, index) => (
                        <tr key={record.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-4 py-4 text-sm font-semibold text-(--muted-foreground) bg-(--card)">
                            {record.id}
                          </td>
                          {visibleFields.map((field) => (
                            <td key={field.key} className="px-4 py-4 text-sm text-(--foreground) bg-(--card) max-w-xs truncate" title={String(record[field.key])}>
                              <span className={field.key === 'password' ? 'font-mono text-(--muted-foreground) bg-(--card) px-2 py-1 rounded' : ''}>
                                {String(record[field.key])}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty State */}
            {generatedData.length === 0 && (
              <div className="bg-(--card) border border-(--border) rounded-xl shadow-md p-16 text-center"> 
                <div className="text-8xl mb-6">📊</div>
                <h3 className="subheading mb-3">No Data Generated Yet</h3>
                <p className="text-(--muted-foreground) text-lg max-w-md mx-auto mb-6">
                  Select your desired fields from the left panel, set the number of records, and click the "Generate Data" button to create fake data.
                </p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={generateData}
                    disabled={selectedFields.length === 0}
                    className="px-6 py-3 bg-(--primary) text-white font-semibold rounded-lg  disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                     Generate Sample Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* ------------------- 6 Cards Section ------------------- */}
        <div className="mt-12">
          <Description /> {/* ← yaha render kar diya */}
        </div>


      </div>
    </div>
  );
};

