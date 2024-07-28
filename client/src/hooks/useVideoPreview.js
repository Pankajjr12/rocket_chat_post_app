import { useState } from "react";
import useShowToast from "./useShowToast";

const usePreviewVideo = () => {
	const [videoUrl, setVideoUrl] = useState(null);
	const showToast = useShowToast();
	const handleVideoChange = (e) => {
		const file = e.target.files[0];
		if (file && file.type.startsWith("video/")) {
			const reader = new FileReader();

			reader.onloadend = () => {
				setVideoUrl(reader.result);
                showToast("Succes", " Video uploaded successfully", "success");
			};

			reader.readAsDataURL(file);
		} else {
			showToast("Invalid file type", " Please select an video file", "error");
			setVideoUrl(null);
		}
	};
	return { handleVideoChange, videoUrl, setVideoUrl};
};

export default usePreviewVideo;