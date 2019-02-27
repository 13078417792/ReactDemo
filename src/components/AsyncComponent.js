import React, { Component } from "react";
import Loading from './Loading/Loading'

export default function AsyncComponent(importComponent) {
    class AsyncComponent extends Component {
        constructor(props) {
            super(props);

            this.state = {
                component: null
            };
        }

        async componentDidMount() {
            const { default: component } = await importComponent();

            // setTimeout(()=>{
            //     this.setState({
            //         component: component
            //     });
            // },0)
            this.setState({
                component: component
            });

        }

        render() {
            const C = this.state.component;

            return C ? <C {...this.props} /> : <Loading size={35} border={2} color={"#85BEE980"} sec_color={"#1E9FFF"}/>;
        }
    }

    return AsyncComponent;
}