import React from "react";
import { Button } from "../../button";
import { MenuButton } from "../../menu-button";
import { OfficersAlbum } from "../../officersalbum";
import "./style.css";

import logo from "../../../pictures/logo.png";
import facebookLogo from "../../../pictures/🦆 icon _facebook squared_.png";
import twitterLogo from "../../../pictures/🦆 icon _twitter_.png";
import telegramLogo from "../../../pictures/🦆 icon _telegram_.png";
import adminImg from "../../../pictures/admin_img.png";
import menuIcon from "../../../pictures/menu_icon.png";
import { MobileMenu } from "./mobile-menu/mobile_menu";
import WelcomeNoteComponent from "../welcome_component";
import CarouselComp from "../../careusal";
import { useNavigate } from "react-router-dom";

export const HomeMobile = () => {
  const navigate = useNavigate();
  const programmesData = [
    "Higher National Diploma in Environmental Health Technology (HND-EHT)",
    "Higher National Diploma in Health Information Management (HND-HIM)",
    "Higher National Diploma in Dental Therapy (HND-DT)",
    "National Diploma in Public Health Technology (ND-PHT)",
    "National Diploma in Epidemiology and Disease Control Technology (ND-EDT)",
    "National Diploma in Environmental Health Technology (ND-EHT)",
    "National Diploma in Dental Therapy (ND-DT)",
    "National Diploma in Health Information Management (ND-HIM)",
    "National Diploma in Community Health (ND-CH)",
    "Diploma in Medical Laboratory Technician (MLT)",
    "Diploma in Pharmacy Technician (DPT)",
    "Diploma in Community Health (CHEW)",
    "Certificate in Community Health (JCHEW)",
  ];

  return (
    <div className="home-mobile">
      <div className="header-section">
        <div className="text-wrapper-9">
          <span className="sub-caption-color">MUSLIM COMMUNITY </span>
          <br />
          COLLEGE OF HEALTH SCIENCE AND TECHNOLOGY FUNTUA
        </div>
        <img className="LOGO-MCCHST" alt="Logo MCCHST" src={logo} />

        <MobileMenu />

        <div className="text-content">
          <p className="empowering-futures">
            <span className="text-wrapper-6">🌟</span>
            <span className="text-wrapper-7">
              Discipline and Academic Excellence
            </span>
            <span className="text-wrapper-6">
              🌟
              <br />
            </span>
            <span className="text-wrapper-4">
              <br />
              Unlock Your Potential, Transform Lives!
            </span>
          </p>
          <p className="text-wrapper-8">
            Are you ready to embark on a rewarding journey in the dynamic world
            of healthcare? Look no further than Muslim Community College of
            Health Science and Technology Funtua, where excellence meets
            compassion, and education transforms into impact.
          </p>

          <Button
            handleClick={() => {
              navigate("/apply");
            }}
            className="button-instance"
            label="APPLY NOW"
          />
        </div>
      </div>

      <div className="news-section">
        <div className="carousel-section">
          <CarouselComp />
        </div>
      </div>

      <div className="motive-section-tab">
        <p className="why-choose-muslim">
          <span className="span">Why Choose </span>
          <span className="text-wrapper-2">Muslim</span>
          <span className="span"> Community?</span>
        </p>
        <div className="global-prospect">
          <p className="p">
            <div className="text-wrapper-3">🌐</div>
            <div className="text-wrapper-5">Global Perspective:</div>
            Gain a global perspective on healthcare. Our programs incorporate
            international best practices, preparing you for a career that
            transcends borders.
          </p>
        </div>
        <div className="integrity">
          <p className="p">
            <div className="text-wrapper-3">🎓</div>
            <div className="text-wrapper-5">Industry-Driven College:</div>
            Learn from professionals who are experts in their fields. Our
            College brings real-world insights, connecting you with the latest
            trends and innovations in healthcare.
          </p>
        </div>
        <div className="inclusive-community">
          <p className="p">
            <div className="text-wrapper-3">🌈</div>
            <div className="text-wrapper-5">Inclusive Community:</div>
            Embrace diversity and be part of an inclusive community that values
            every voice. Muslim Community College of Health Science and
            Technology Funtua fosters a supportive environment where students
            from all backgrounds come together to learn and grow.
          </p>
        </div>
      </div>

      <div className="programs-section">
        <div className="overlap-3">
          <div className="overlap-group-wrapper">
            <div className="overlap-group-4">
              <div className="overlap-group-wrapper">
                <div className="overlap-group-4">
                  <div className="rectangle-3" />
                  <img
                    className="admin-block"
                    alt="Admin block"
                    src={adminImg}
                  />
                </div>
              </div>
              <div className="rectangle-4" />
            </div>
          </div>
          <div className="flexcontainer">
            <p className="text">
              <span className="text-wrapper-16">
                Discover Our Programs:
                <br />
              </span>
              <div>
                <ul>
                  {programmesData.map((programme, index) => (
                    <li key={index} className="programs-text">
                      {programme}
                    </li>
                  ))}
                </ul>
              </div>
            </p>
          </div>
        </div>
      </div>

      <div className="welcome-section">
        <div className="overlap-group-3">
          <WelcomeNoteComponent />
        </div>
      </div>

      <div className="footer-section">
        <footer className="footer">
          <div className="footer-bg">
            <div className="links">
              <div className="text-wrapper-10">Quick Links:</div>
              <div className="link">
                <div className="text-wrapper-11">Admission</div>
                <div className="text-wrapper-12">News</div>
                <div className="text-wrapper-12">Calender</div>
                <div className="text-wrapper-12">FAQ</div>
              </div>
            </div>

            <div className="social-media">
              <div className="text-wrapper-14">Our Social Media:</div>
              <div>
                <img className="icons" alt="Icon telegram" src={telegramLogo} />
                <img className="icons" alt="Icon facebook" src={facebookLogo} />
                <img className="icons" alt="Icon twitter" src={twitterLogo} />
              </div>
            </div>

            <div className="copyright-div">
              Copyright © 2024 MCCHST. All Rights Reserved.
              <div className="powered-text">
                Powered by:{" "}
                <a
                  href="https://foudhan.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Foudhan Technologies
                </a>
                .
              </div>
            </div>
          </div>
        </footer>

        {/* 
        <div className="frame-2">
          <div className="text-wrapper-14">Our Social Media:</div>
          <div>
            <img className="icons" alt="Icon telegram" src={telegramLogo} />
            <img className="icons" alt="Icon facebook" src={facebookLogo} />
            <img className="icons" alt="Icon twitter" src={twitterLogo} />
          </div>
        </div>

        <div className="copyright-div">
          Copyright © 2024 MCCHST. All Rights Reserved.
          <div className="powered-text">Powered by: Foudhan Technologies.</div>
        </div> */}
      </div>
    </div>
  );
};
