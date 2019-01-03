import React,{Component} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router'
import {Link} from 'react-router-dom'
import Layout from '../../components/Layout/Layout'
import {TextBox,IconButton,Button} from 'react-uwp'
import './PicConvertStyle.less'
import '../../css/iconfont.less'
import FileHelper from '../../util/File'

export default withRouter(class PicToBase extends Component{

    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    // static
    static contextTypes = { theme: PropTypes.object }

    constructor(props){
        super(props)
        this.state = {
            picture_base:null
        }
    }

    handleFileInputChange(e){
        const {target} = e
        const files = target.files
        if(files.length===0) return false;
        const file = files[0]
        console.log(file)
        FileHelper.toBase(file).then(base=>{
            console.log(base)
            this.setState({
                picture_base:base
            })
        }).catch(e=>{
            console.error(e)
        })
    }

    preview(){
        if(!this.state.picture_base){
            return null
        }
        return (
            <div className="preview cl">

                <div className="code-wrap">
                    <textarea className="code" disabled >
                        {this.state.picture_base}
                    </textarea>

                    <div className="copy">
                        {/*<IconButton>CopyLegacy</IconButton>*/}
                        <Button icon="CopyLegacy" className={"copy-button"}>
                            复制
                        </Button>
                    </div>


                </div>

                <div className="preview-picture">

                    <img src={this.state.picture_base} alt=""/>
                </div>
            </div>
        )
    }

    render(){
        const {theme} = this.context
        const Preview = this.preview.bind(this)
        return (
            <Layout>
                <div className="tool-item-Pic-to-base64">
                    <p>图片转BASE64</p>

                    <label className="choose-file" htmlFor="picture" style={{
                        // background:theme.acrylicTexture40.background
                    }}>
                        <i className="iconfont">&#xe822;</i>
                        <input type="file" id="picture" accept="image/*" onChange={this.handleFileInputChange.bind(this)} />
                    </label>

                    <Preview />

                </div>
            </Layout>
        )
    }
})