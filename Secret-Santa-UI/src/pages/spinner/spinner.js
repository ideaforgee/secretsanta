import React from "react";
import { useLoading } from "../../context/LoadingContext";
import { HashLoader } from "react-spinners";
import '../../pages/spinner/spinner.css';

const Spinner = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="spinner-overlay">
      <div className="spinner-container">
        <div className="climbing-box-loader">
          <HashLoader color="#ff6f61" loading={isLoading} size={50} />
        </div>
      </div>
      <p className="spinner-text">Preparing your Secret Santa surprise...</p>
    </div>
  );
};

export default Spinner;
