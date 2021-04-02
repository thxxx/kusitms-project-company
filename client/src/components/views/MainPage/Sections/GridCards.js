import React from 'react'
import {Col} from 'antd';

function GridCards(props) {
    return (
        <div>
            <Col lg={12} xs={24}>
            <div style={{position:'relative'}}>
                <img style={{width:'100%', height:'320px'}} src 
                    alt={props.result}/>
                        
            </div>
            </Col>
        </div>
    )
}

export default GridCards
