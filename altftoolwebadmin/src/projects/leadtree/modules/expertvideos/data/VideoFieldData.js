import { Calendar, FilmIcon, List, ReceiptIcon, ReceiptText, Type } from "lucide-react";


export const videoFields=[
    {
      name:"title"  ,
      label:"VIDEO TITLE",
      placeholder:"Enter Video Title",
      rules:{
        required:"Title is required"
      },
      icon:Type
    },



    {
        name: "subTitle",
        label: "SUB TITLE",
        placeholder: "Enter Video SubTitle",
        rules: {
            required: "SubTitle is required"
        },
        icon: Type
    },


    {
        name: "cateogry",
        label: "VIDEO CATEOGRY",
        placeholder: "Select Video Cateogry",
        rules: {
            required: "Cateogry is required"
        },
        icon: List
    },

    {
        name: "date",
        label: "Publish Date",
        placeholder: "dd/mm/yyyy",
        rules: {
            required: "Date is required"
        },
        icon: Calendar
    },



    {
        name: "description",
        label: "Description",
        placeholder: "Write a description , summarization of video",
        rules: {
            required: "Description is required"
        },
        type:"textarea",
        icon: ReceiptText
    },


    {
        name: "thumbnailAlt",
        label: "Thumbnail Alt Text",
        placeholder: "Talks about Business Loan",
        rules: {
            required: "Thumbnail alt text is required"
        },
       
        icon: Type
    },


    {
        name: "aspectRatio",
        label: "Aspect Ratio",
        placeholder: "Select the best ratio for better visiblity",
        rules: {
            required: "Thumnail Ratio is required"
        },
        option:["1:1 Square","9:16 Vertical(Shorts)" , "16:9 -Landscape"],

        icon: FilmIcon
    },



]









