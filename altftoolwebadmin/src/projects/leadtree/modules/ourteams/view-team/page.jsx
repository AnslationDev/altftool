'use client'
import { EllipsisVertical, Instagram, LinkedinIcon, Mail, Twitter, Users2Icon } from 'lucide-react';
import  { useEffect, useState } from 'react'
import { deleteMember, deleteMemberProfileImage, fetchAllMembers, updateMember, uploadMemberProfileImage } from '../our-team-services/OurTeamService';
import { emitAlert } from '@/lib/alertBus';

const ViewTeam = () => {

const [teamMembers, setTeamMembers] = useState([])
const [loading, setLoading] = useState(true)

const [activeMenuId, setActiveMenuId] = useState(null);
const [editModalOpen, setEditModalOpen] = useState(false);
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [selectedMember, setSelectedMember] = useState(null);
const [searchMember, setSearchMember] = useState("");




  useEffect(() => {
    (async () => {
      try {
        setTeamMembers(await fetchAllMembers());
      } catch (err) {
        console.error(err);
        emitAlert({ type: "error", message: "Failed to load cards" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);



const filteredMembers=teamMembers.filter((member)=>{
const lowerSearch=searchMember.toLowerCase();
return(
    member.name.toLowerCase().includes(lowerSearch) || member.role.toLowerCase().includes(lowerSearch) ||
    member.description?.toLowerCase().includes(lowerSearch)
)
})

const modalData=["Edit Member","Delete Member",]

const handleDeleteMember = async (member) => {
  const confirmDelete = confirm(`Delete ${member.name}?`);

  if (!confirmDelete) return;

  try {
    await deleteMember(member.id);

    
    setTeamMembers((prev) => prev.filter((m) => m.id !== member.id));

    emitAlert({ type: "success", message: "Member deleted" });
  } catch (err) {
    console.error(err);
    emitAlert({ type: "error", message: "Delete failed" });
  }
};

function SkeletonCard() {
  return (
    <div className="w-[280px] h-[320px] rounded-xl border border-gray-100 bg-white animate-pulse overflow-hidden shadow-sm">
      <div className="w-full h-48 bg-gray-200" />
      <div className="flex flex-col items-center gap-2 p-4">
        <div className="h-4 w-32 bg-gray-200 rounded-full" />
        <div className="h-3 w-24 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}


if (loading) {
    return <SkeletonCard />;
}

  return (
    <div className="flex  flex-col  p-2 w-full">
      <div className="flex items-center justify-end w-full ">
        <div className="flex items-center justify-end gap-5 w-96  ">
          <input
            type="text"
            value={searchMember}
            onChange={(e)=>setSearchMember(e.target.value)}
            placeholder="Search all the members..."
            className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-gray-400  transition-all duration-200 focus:border-none"
          />
        
        </div>
      </div>
      <div className="flex py-3">
        <div className="flex items-start gap-2  ">
          <Users2Icon />
          <div className="flex flex-col  items-start justify-start">
            <h1 className="font-semibold text-xl text-gray-800">
              All the listed Members
            </h1>
            <p className=" text-sm text-gray-600 ">
              Find here all the team behind lead tree
            </p>
          </div>
        </div>
      </div>

      {/* Members card */}

      <div className="flex items-center w-full p-3 relative top-5">
        <div className="flex gap-5 items-start w-full flex-wrap">
          {filteredMembers.map((member) => {
            return (
              <div
                key={member.id}
                className="group bg-white w-[280px] h-[290px] rounded-md border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer relative overflow-hidden"
              >
                {/* 3 DOT MENU */}
                <div
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(
                      activeMenuId === member.id ? null : member.id,
                    );
                  }}
                >
                  <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow">
                    <EllipsisVertical size={16} />
                  </div>
                </div>

                {/* DROPDOWN */}
                {activeMenuId === member.id && (
                  <div className="absolute top-10 right-2 bg-white border border-gray-300 rounded shadow w-44 z-30 cursor-pointer">
                    {modalData.map((item, i) => (
                      <div
                        key={i}
                        className="px-4 py-2 hover:bg-gray-100 text-sm cursor-pointer"
                        onClick={() => {
                          if (item === "Edit Member") {
                            setSelectedMember(member);
                            setEditModalOpen(true);
                          }

                          if (item === "Delete Member") {
                            handleDeleteMember(member);
                          }

                          setActiveMenuId(null);
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}

                {/* IMAGE */}
                <div className="relative overflow-hidden">
                  <img
                    src={member.profileImageUrl}
                    className="w-full h-[180px] object-cover group-hover:scale-105 transition duration-300"
                  />

                  {/* SOCIAL ICONS */}
                </div>

                {/* INFO */}
                <div className="flex flex-col items-center mt-3">
                  <h1 className="text-blue-600 font-bold">{member.name}</h1>
                  <p className="text-gray-600 text-sm">{member.role}</p>
                </div>

                <div className="absolute w-full flex justify-center gap-3 bottom-2 opacity-0 group-hover:bottom-4 group-hover:opacity-100 transition-all duration-500">
                  {member.socialLinks?.map((link, i) => (
                    <a
                      key={i}
                      href={
                        link.type === "Email"
                          ? `mailto:${link.value}`
                          : link.value
                      }
                      target="_blank"
                      className="bg-white p-2 rounded-full shadow"
                    >
                      {link.type === "LinkedIn" && (
                        <LinkedinIcon size={16} className="text-gray-600" />
                      )}
                      {link.type === "Twitter" && (
                        <Twitter size={16} className="text-gray-600" />
                      )}
                      {link.type === "Instagram" && (
                        <Instagram size={16} className="text-gray-600" />
                      )}
                      {link.type === "Email" && (
                        <Mail size={16} className="text-gray-600" />
                      )}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 ">
          <div className="bg-white w-[450px] p-6 rounded-lg max-h-[80vh] overflow-y-auto ">
            <h2 className="text-lg font-semibold mb-4">Edit Member</h2>
            <div className="min-h-[200px] relative">
              {/* IMAGE PREVIEW */}
              {selectedMember.profileImageUrl ? (
                <div className=''>
                  <img
                    src={selectedMember.profileImageUrl}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              ) : (
                <div className="w-full h-[150px] flex items-center justify-center border rounded bg-gray-50 text-gray-400">
                  No Image
                </div>
              )}

              {/* HIDDEN FILE INPUT */}
              <input
                type="file"
                accept="image/*"
                id="fileUpload"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  try {
                    const url = await uploadMemberProfileImage({
                      file,
                      memberId: selectedMember.id,
                    });

                    setSelectedMember({
                      ...selectedMember,
                      profileImageUrl: url,
                    });

                    emitAlert({ type: "success", message: "Image uploaded" });
                  } catch {
                    emitAlert({ type: "error", message: "Upload failed" });
                  }
                }}
              />

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 mt-3">
                {/* ✅ SHOW DELETE ONLY IF IMAGE EXISTS */}
                {selectedMember.profileImageUrl && (
                  <button
                    onClick={async () => {
                      try {
                        await deleteMemberProfileImage(selectedMember.id);

                        setSelectedMember({
                          ...selectedMember,
                          profileImageUrl: "",
                        });

                        emitAlert({
                          type: "success",
                          message: "Image deleted",
                        });
                      } catch {
                        emitAlert({ type: "error", message: "Delete failed" });
                      }
                    }}
                    className="bg-red-500 text-white px-3 py-2 rounded-md text-sm hover:bg-red-600 cursor-pointer"
                  >
                    Delete Image
                  </button>
                )}

                {/* ✅ SHOW UPLOAD ONLY IF NO IMAGE */}
                {!selectedMember.profileImageUrl && (
                  <label
                    htmlFor="fileUpload"
                    className="flex items-center gap-2 bg-black text-white px-3 py-1 rounded-md text-sm cursor-pointer hover:bg-gray-800"
                  >
                    <span className="text-lg">＋</span>
                    Upload Image
                  </label>
                )}
              </div>
            </div>

            <div className="flex flex-col mt-3">
              {/* NAME */}
              <input
                value={selectedMember.name}
                onChange={(e) =>
                  setSelectedMember({ ...selectedMember, name: e.target.value })
                }
                className="border border-gray-500  focus:ring-1 focus:border-none focus:ring-blue-400 focus:outline-none  rounded-md text-gray-600 w-full p-2 mb-2"
              />

              {/* ROLE */}
              <input
                value={selectedMember.role}
                onChange={(e) =>
                  setSelectedMember({ ...selectedMember, role: e.target.value })
                }
                className="border border-gray-500  focus:ring-1 focus:border-none focus:ring-blue-400 focus:outline-none  rounded-md text-gray-600 w-full p-2 mb-2"
              />

              {/* DESCRIPTION */}
              <textarea
                value={selectedMember.description || ""}
                onChange={(e) =>
                  setSelectedMember({
                    ...selectedMember,
                    description: e.target.value,
                  })
                }
                className="border border-gray-500  focus:ring-1 focus:border-none focus:ring-blue-400 focus:outline-none  rounded-md text-gray-600 w-full p-2 mb-2"
              />
            </div>

            {/* SOCIAL LINKS */}
            <div className="mb-3">
              <p className="text-sm font-medium mb-2">Social Links</p>

              {selectedMember.socialLinks?.map((link, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    value={link.type}
                    onChange={(e) => {
                      const updated = [...selectedMember.socialLinks];
                      updated[index].type = e.target.value;
                      setSelectedMember({
                        ...selectedMember,
                        socialLinks: updated,
                      });
                    }}
                    className="border  focus:ring-1 focus:border-none focus:ring-gray-500 focus:outline-none  rounded-md text-gray-700 w-1/3 p-2 mb-2"
                  />

                  <input
                    value={link.value}
                    onChange={(e) => {
                      const updated = [...selectedMember.socialLinks];
                      updated[index].value = e.target.value;
                      setSelectedMember({
                        ...selectedMember,
                        socialLinks: updated,
                      });
                    }}
                    className="border  focus:ring-1 focus:border-none focus:ring-gray-500 focus:outline-none  rounded-md text-gray-700 w-2/3 p-2 mb-2"
                  />

                  <button
                    onClick={() => {
                      const updated = selectedMember.socialLinks.filter(
                        (_, i) => i !== index,
                      );
                      setSelectedMember({
                        ...selectedMember,
                        socialLinks: updated,
                      });
                    }}
                    className="text-red-500 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                onClick={() =>
                  setSelectedMember({
                    ...selectedMember,
                    socialLinks: [
                      ...(selectedMember.socialLinks || []),
                      { type: "", value: "" },
                    ],
                  })
                }
                className="text-blue-500 text-sm cursor-pointer"
              >
                + Add Link
              </button>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditModalOpen(false)}
                className="border px-3 py-1 rounded-md cursor-pointer hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await updateMember(selectedMember.id, {
                    name: selectedMember.name,
                    role: selectedMember.role,
                    description: selectedMember.description,
                    profileImageUrl: selectedMember.profileImageUrl,
                    socialLinks: selectedMember.socialLinks,
                  });

                  emitAlert({ type: "success", message: "Updated" });
                  setEditModalOpen(false);

                  const data = await fetchAllMembers();
                  setTeamMembers(data);
                }}
                className="bg-black text-white px-4 py-1 rounded-md cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewTeam