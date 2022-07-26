import React, { useEffect, useRef, useState } from "react";
import "./Viewpage.css";
import { Worker } from "@react-pdf-viewer/core";
import { Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import MultiCrops from "react-multi-crops";

const Viewpage = () => {
  const [file, setfile] = useState(null);
  const [filepreview, setfilepreview] = useState(null);
  const _width = useRef(window.innerWidth);
  const [coordinates, setCoordinates] = useState([]);
  const [width, setWidth] = useState(window.innerWidth * 0.6);
  const canvasref = useRef(null);
  const contextref = useRef(null);
  const fileref = useRef(null);
  const imgref = useRef(null);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setfilepreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      console.log("no files");
    }
  }, [file]);

  useEffect(() => {
    window.onresize = () => {
      const ratio = window.innerWidth / _width.current;
      console.log(ratio, coordinates[0]);
      _width.current = window.innerWidth;
      setWidth(window.innerWidth * 0.6);
      setCoordinates(
        coordinates.map((c) => ({
          ...c,
          x: c.x * ratio,
          y: c.y * ratio,
          width: c.width * ratio,
        }))
      );
    };

    const ctx = canvasref.current.getContext("2d");
    contextref.current = ctx;
    if (coordinates.length > 0) {
      const image = imgref.current.img;
      const scalex = image.naturalWidth / image.width;
      const scaley = image.naturalHeight / image.height;
      const sx = coordinates[coordinates.length - 1]["x"] * scalex;
      const sy = coordinates[coordinates.length - 1]["y"] * scaley;
      const swidth = coordinates[coordinates.length - 1]["width"] * scalex;
      const sheight = coordinates[coordinates.length - 1]["height"] * scaley;
      const dx = 0;
      const dy = 0;
      const dwidth = 300;
      const dheight = 150;

      console.log(image);
      console.log(sx, sy, swidth, sheight);
      ctx.clearRect(0, 0, 400, 200);
      ctx.drawImage(image, sx, sy, swidth, sheight, dx, dy, dwidth, dheight);
    } else {
      ctx.clearRect(0, 0, 400, 200);
    }
  }, [coordinates]);

  const uploadfile = (event) => {
    setfile(event.target.files[0]);
  };

  const changeCoordinate = (coordinate, index, coordinates) => {
    setCoordinates(coordinates);
  };
  const deleteCoordinate = (coordinate, index, coordinates) => {
    setCoordinates(coordinates);
  };

  console.log(coordinates);
  console.log(width);
  console.log(file);
  console.log(filepreview);

  return (
    <div className="webpage">
      <button
        className="uploadbtn"
        onClick={(e) => {
          e.preventDefault();
          fileref.current.click();
        }}
      >
        upload file
      </button>
      <div className="mainbox">
        {filepreview && file && file.type === "application/pdf" ? (
          <div className="filepreviewbox">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.14.305/build/pdf.worker.min.js">
              <Viewer fileUrl={filepreview} />
            </Worker>
          </div>
        ) : (
          <div className="previewbox">
            <MultiCrops
              src={filepreview}
              width={width}
              ref={imgref}
              coordinates={coordinates}
              onChange={changeCoordinate}
              onDelete={deleteCoordinate}
              onLoad={(e) => console.log(e.currentTarget.height)}
            />
          </div>
        )}

        <div className="croppedbox">
          <div className="croppedimg">
            <canvas ref={canvasref} style={{ height: "100%", width: "100%" }} />
          </div>
          {coordinates.length > 0 && (
            <div className="croppeddetails">
              <div className="columnflex">
                <div className="margin">
                  X: {coordinates[coordinates.length - 1]["x"]} px
                </div>
                <div className="margin">
                  Y: {coordinates[coordinates.length - 1]["y"]} px
                </div>
              </div>
              <div className="columnflex">
                <div className="margin">
                  Width: {coordinates[coordinates.length - 1]["width"]} px
                </div>
                <div className="margin">
                  Height: {coordinates[coordinates.length - 1]["height"]} px
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <form>
        <input
          style={{ display: "none" }}
          accept="application/pdf, image/*"
          type="file"
          ref={fileref}
          onChange={(e) => uploadfile(e)}
        />
      </form>
    </div>
  );
};

export default Viewpage;
