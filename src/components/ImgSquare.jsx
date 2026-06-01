import React from 'react';

const ImgSquare = () => {
    return (
        <div>
            <p className="browser-warning">
                If this looks wonky to you it's because this browser doesn't support the CSS
                property 'aspect-ratio'.
            </p>
            <div className="stack">
                <div className="card">
                    <div className="image"></div>
                </div>
            </div>

        </div>
    );
}

export default ImgSquare;
