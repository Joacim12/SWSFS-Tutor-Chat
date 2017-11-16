import React, {Component} from 'react';
import '../css/popup.css'


class SmileyPicker extends Component {


    state = {
        smileys: ["😀","😁","😂","💩","😵","🤯","😓","😎"]
    }


    renderSmileys = () => {
        return this.state.smileys.map((smiley, index) => {
            return (
                <span key={index}>
                    <span style={{fontSize:"20px"}} onClick={this.addSmiley}id={smiley}>{smiley}</span>
                </span>
            )
        })
    }

    addSmiley = (e)=>{
        document.getElementById("smiley").classList.toggle("show");
        this.props.smiley(e.target.id);
    }

    updateParent = (e) => {
        this.props.file(e);
    }

    showPopUp = () => {
        document.getElementById("smiley").classList.toggle("show");
    }

    render = () => {
        return (
            <div className="container">
                <div className="popup">
                    <span role="img" aria-label="smiley" style={{cursor: 'pointer', fontSize: "1.5em", padding: "10px"}}
                          onClick={this.showPopUp}>&#128522;</span>
                    <span className="popuptext" id="smiley">{this.renderSmileys()}</span>
                </div>
                <label htmlFor="file" style={{cursor: 'pointer'}}>
                    <span role="img" aria-label="smiley" style={{cursor: 'pointer', fontSize: "1.5em", padding: "10px"}}
                          onClick={this.updateParent}>&#128206;</span>
                </label>

                <input type="file" id="file" hidden onChange={(e) => this.updateParent(e)}/>
            </div>
        )
    }
}

export default SmileyPicker;
