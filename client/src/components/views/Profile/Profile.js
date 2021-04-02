import React, {useState} from 'react'
import './Profile.css';
import { faUser, faMedal,faCaretDown, faChevronCircleRight} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from 'axios';

function Profile(props) {
    let MedalProjects = props.medalProjects; 
    //let Projects= props.Projects;
    let FreeRiderProjects = props.freeRiderProjects;
    let ContributionAverage = props.projectContributionAverage;
    
    return (
        <div>
             {/* Profile Area*/}
        <div className="area_profile">
          {/* User Profile */}
          <ul className="userProfile">
            <li><h3>{props.userName} 님</h3></li>
            <li><FontAwesomeIcon icon={faUser} /></li>
            <li><FontAwesomeIcon icon={faMedal} style={{color:'#FFC700'}} /><p>최고의 팀원</p></li>
          </ul>
          {/* User Info */}
          <div className="userInfo">
            <p className="Rate">
              팀플 기여도 평균: {ContributionAverage} 점</p>
            <div className="BadgeAndList">
              <div>
                <p className="Badge" style={{fontWeight: '700'}}> 
                팀플 금메달 총 {MedalProjects.length} 개</p>
              </div>
              <div id="totalBadge">
                <ul>
                {MedalProjects.map((project, index)=>(
                        <React.Fragment key={index}>
                            <li>{project.title} 금메달</li>
                        </React.Fragment>
                ))}
                </ul>
              </div>
            </div>
            <div className="BadgeAndList">
              <div>
                <p className="Badge" style={{fontWeight: '700'}}>
                  FreeRider 총 {FreeRiderProjects.length} 개</p>
              </div>
              <div id="totalBadge">
                <ul>
                {FreeRiderProjects.map((project, index)=>(
                        <React.Fragment key={index}>
                            <li>{project.title}</li>
                        </React.Fragment>
                ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      );

        </div>
    )
}

export default Profile
