import {useState} from "react";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


const SettingsComponent = () => {

    const [tankNumber, setTankNumber] = useState(0);
    const handleChange = (event) => {
        setTankNumber(event.target.value);
    };



    return (
        <div>
            <h1>Settings Component</h1>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Tank Number</InputLabel>
                <Select
                    id="tankNumberSelector"
                    value={tankNumber}
                    label="tankNumber"
                    onChange={handleChange}
                >
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={3}>3</MenuItem>
                </Select>
            </FormControl>
        </div>
    )
}

export default SettingsComponent