import React from 'react'
import Switch from "react-switch";

const ToggleSwitch = ({ width, height, handleDiameter, checked, handleChange, disabled = false }) => {
    return (
        <label>
            <Switch
                onChange={handleChange}
                checked={checked}
                className="react-switch"
                onColor='#008060'
                checkedIcon={false}
                uncheckedIcon={false}
                height={height}
                width={width}
                handleDiameter={handleDiameter}
                disabled={disabled}

            />
        </label>
    )
}

export default ToggleSwitch