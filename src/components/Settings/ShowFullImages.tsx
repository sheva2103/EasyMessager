import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    IconButton,
    Box
} from "@mui/material";

import ArrowUp from '../../assets/caret-up-fill.svg'

type ImageDialogProps = {
    open: boolean;
    onClose: (e: React.MouseEvent) => void;
    images: string[];
    startIndex?: number
};

const ImageDialog: React.FC<ImageDialogProps> = ({ open, onClose, images, startIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);

    useEffect(() => {
        if (open) {
            setCurrentIndex(startIndex);
        }
    }, [open, startIndex])

    const handlePrev = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xl"
            fullWidth
        >
            <DialogContent sx={{ position: "relative", p: 0 }} onClick={e => e.stopPropagation()}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        maxHeight: "90vh",
                        overflow: "hidden",
                        position: "relative",
                        backgroundColor: 'dimgray'
                    }}
                >
                    <img
                        src={images[currentIndex]}
                        alt={`image-${currentIndex}`}
                        style={{
                            maxWidth: "100%",
                            maxHeight: "90vh",
                            objectFit: "contain"
                        }}
                    />
                    {images.length > 1 && (
                        <>
                            <IconButton
                                onClick={handlePrev}
                                sx={{
                                    position: "absolute",
                                    left: 8,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    backgroundColor: "rgba(0,0,0,0.4)",
                                    color: "white"
                                }}
                            >
                                <ArrowUp style={{ transform: 'rotate(270deg)' }} />
                            </IconButton>
                            <IconButton
                                onClick={handleNext}
                                sx={{
                                    position: "absolute",
                                    right: 8,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    backgroundColor: "rgba(0,0,0,0.4)",
                                    color: "white"
                                }}
                            >
                                <ArrowUp style={{ transform: 'rotate(90deg)' }} />
                            </IconButton>
                        </>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ImageDialog;