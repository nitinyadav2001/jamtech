import axios from "./axios";

//Get all course api function call here.....................................
export const getAllCourseAPI = async () => {
  return await axios.get("/course/pageLevel/fetchAllCourse");
};