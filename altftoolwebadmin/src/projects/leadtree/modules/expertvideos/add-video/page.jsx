'use client'
import { ArrowDown, ArrowLeft, ChevronDown, Clapperboard, Film, Image, List, ListCheck, Sparkle, Type } from 'lucide-react'
import React from 'react'
import { Field } from '../../creditcard/styles/FieldStyle'
import { Input } from '../../creditcard/styles/InputStyle'
import { useForm } from 'react-hook-form'
import { videoFields } from '../data/VideoFieldData'
import { FormField } from '../data/FormFields'

const AddExpertVideo = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      title: "",
      subTitle: "",
      category: "",
      videoType: "long",
    },
  });


  const watchedValue = watch()

  return (
    <div className='p-5 min-h-screen ' >
      <div className='flex justify-between items-center   '>
        <div className='w-[50%] flex flex-col gap-10  '>
          <div className='bg-black rounded-full text-white flex items-center gap-1 px-2 py-1.5 text-[14px] w-50 '>
            <Sparkle className='h-4 w-4' /> Admin · Content Studio
          </div>

          <div className='flex flex-col items-start '>
            <div className='flex items-center gap-3 text-[20px] font-bold '>
              <div className='bg-gray-200 rounded-md shadow-2xs border border-gray-300 h-8 w-8 flex items-center justify-center transition-all duration-300 cursor-pointer hover:-translate-x-1 '>
                <ArrowLeft className='h-5 w-5 text-gray-600 ' />
              </div>
              <h1> Upload Expert Video</h1>


            </div>
            <div className='text-gray-500 text-sm ml-12 '>
              <p>Add a new video or short to your library. Fill in the details below.

              </p>
            </div>
          </div>

        </div>

        <div className='w-[50%]'>

        </div>
      </div>

      <form className=' relative top-10'>
        <div className='flex justify-between items-center w-[420px] px-3 py-3 border border-gray-300 shadow-sm rounded-lg gap-2'>
          <button className={`flex items-center justify-center gap-2 text-gray-200 font-medium w-50 bg-black  rounded-lg p-2.5 ${watch("videoType") === "long" ? "bg-black text-white" : "bg-white text-black"}`} type='button' value="long">
            <Film className='h-5 w-5' />Long Video
          </button>
          <button className='flex items-center justify-center gap-2 text-gray-200 font-medium w-50 text-gray-600  rounded-lg p-2.5'>
            <Clapperboard className='h-5 w-5' /> Short Video
          </button>
        </div>

        <div className='min-h-[500px] rounded-lg p-3 border-gray-200 grid lg:grid-cols-1 gap-2 relative top-5'>


          <div className='grid gap-3'>

            <div className=' flex flex-col  border border-gray-200 shadow-2xs rounded-md p-2'>
              <div className='flex items-center gap-2 px-3 py-2 border-b border-gray-200 '>

                <div className='h-10 w-10 border border-gray-200 flex items-center justify-center rounded-md'>
                  <List />
                </div>

                <div className='flex flex-col mt-2 '>
                  <h1 className='font-bold text-[17px] '>Basic Info</h1>
                  <p className='text-gray-600 text-sm'>Title, category, description and publish date.

                  </p>
                </div>

              </div>

              <div className="flex flex-col gap-5 p-3 ">
                <div className="grid grid-cols-2 gap-3">
                  {videoFields.slice(0,3).map((field) => (
                    <FormField
                      key={field.name}
                      field={field}
                      register={register}
                      errors={errors}
                    />
                  ))}
                </div>

<div className=''>
                  {videoFields.slice(4).map((field) => (
                    <FormField
                      key={field.name}
                      field={field}
                      register={register}
                      errors={errors}
                    />
                  ))}
</div>

              </div>

            </div>

            <div className=' flex flex-col  border border-gray-200 shadow-2xs rounded-md p-2'>
              <div className='flex items-center gap-2 px-3 py-2 border-b border-gray-200  '>

                <div className='h-10 w-10 border border-gray-200 flex items-center justify-center rounded-md'>
                  <Image />
                </div>

                <div className='flex flex-col mt-2 '>
                  <h1 className='font-bold text-[17px] '>Thumbnail Info</h1>
                  <p className='text-gray-600 text-sm'>Upload a cover image, set alt text and a short caption.



                  </p>
                </div>

              </div>

              <div className="flex flex-col gap-5 p-3 ">
                <div className="grid grid-cols-2 gap-3">
                  {videoFields.slice(5,6).map((field) => (
                    <FormField
                      key={field.name}
                      field={field}
                      register={register}
                      errors={errors}
                    />
                  ))}
                </div>

                <div className=''>
                  {videoFields.slice(4).map((field) => (
                    <FormField
                      key={field.name}
                      field={field}
                      register={register}
                      errors={errors}
                    />
                  ))}
                </div>

              </div>

            </div>

          </div>

          <div className=''>
hlw
          </div>
        </div>



      </form>


    </div>
  )
}

export default AddExpertVideo