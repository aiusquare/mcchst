import React from "react";
import { Button } from "../../button";
import { MenuButton } from "../../menu-button";
import logo from "../../../pictures/logo.png";
import facebookLogo from "../../../pictures/🦆 icon _facebook squared_.png";
import twitterLogo from "../../../pictures/🦆 icon _twitter_.png";
import telegramLogo from "../../../pictures/🦆 icon _telegram_.png";
import adminImg from "../../../pictures/admin_img.png";
import "./style.css";
import { useNavigate } from "react-router-dom";
import CarouselComp from "../../careusal";

export const HomeDesktop = () => {
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
    <div className="desktop">
      <div className="head-section">
        <div className="menu-bar">
          <MenuButton label="Apply Now" navigateTo={"apply"} />
          <MenuButton label="Login" navigateTo={"login"} />
          <MenuButton label="Our History" navigateTo={"about"} />
          <MenuButton label="Support" navigateTo={"contact"} />
        </div>

        <div className="frame-2">
          <p className="p">
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
        <p className="empowering-futures">
          <span className="span">🌟</span>
          <span className="text-wrapper-4">
            Discipline and Academic Excellence
          </span>
          <span className="span">
            🌟
            <br />
          </span>
          <span className="text-wrapper-5">
            <br />
            Unlock Your Potential, Transform Lives!
          </span>
        </p>

        <div className="logo-frame">
          <div className="colleges-title">
            <div className="college-caption">
              <span className="sub-caption-color">MUSLIM COMMUNITY </span>
              <br />
              COLLEGE OF HEALTH SCIENCE AND TECHNOLOGY FUNTUA
            </div>
          </div>
          <img className="LOGO-MCCHST" alt="Logo MCCHST" src={logo} />
        </div>
      </div>

      <div className="news-section">
        <div className="carousel-section">
          <CarouselComp />
        </div>
      </div>

      <div className="motive-frame">
        <p className="why-choose-muslim">
          <span className="text-wrapper-15">Why Choose </span>
          <span className="text-wrapper-16">Muslim</span>
          <span className="text-wrapper-15"> Community?</span>
        </p>

        <div className="motive-section">
          <div className="motive-section-2">
            <div className="global-prospect">
              <p className="div-4">
                <div className="text-wrapper-17">🌐</div>

                <div className="text-wrapper-18">Global Perspective:</div>
                <div className="motive-main-text">
                  Gain a global perspective on healthcare. Our programs
                  incorporate international best practices, preparing you for a
                  career that transcends borders.
                </div>
              </p>
            </div>
            <div className="integrity">
              <p className="div-4">
                <div className="text-wrapper-17">🎓</div>

                <div className="text-wrapper-18">
                  Industry-Driven Institute:
                </div>
                <div className="motive-main-text">
                  Learn from professionals who are experts in their fields. Our
                  college brings real-world insights, connecting you with the
                  latest trends and innovations in healthcare.
                </div>
              </p>
            </div>
            <div className="inclusive-community">
              <p className="div-4">
                <div className="text-wrapper-17">🌈</div>

                <div className="text-wrapper-18">Inclusive Community:</div>
                <div className="motive-main-text">
                  Embrace diversity and be part of an inclusive community that
                  values every voice. Muslim Community College of Health Science
                  and Technology Funtua fosters a supportive environment where
                  students from all backgrounds come together to learn and grow.
                </div>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="programs-section">
        <div className="overlap-group-wrapper">
          <div className="overlap-group-2">
            <div className="overlap-group-wrapper">
              <div className="overlap-group-2">
                <div className="rectangle-2" />
                <img className="admin-block" alt="Admin block" src={adminImg} />
              </div>
            </div>
            <div className="rectangle-3" />
          </div>
        </div>
        <div className="flexcontainer">
          <p className="text">
            <span className="text-wrapper-12">
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

      <div className="welcome-section">
        <div className="overlap">
          <div
            style={{ textAlign: "justify", padding: "100px", color: "#f3f1f1" }}
          >
            <h2 style={{ textAlign: "center", fontWeight: "900" }}>
              Welcome to Muslim Community College of Health Sciences and
              Technology Funtua
            </h2>
            <br />
            <p>
              We are delighted to have you visit our online home! At Muslim
              Community College of Health Sciences and Technology Funtua, we
              strive for academic excellence and are committed to contributing
              to national development through training, research, and manpower
              development in the healthcare sector.
            </p>
            <p>
              Explore our programs, learn about our vision and mission, and
              discover how we aim to make a positive impact on primary and
              secondary healthcare systems. Feel free to contact us if you have
              any inquiries or need more information.
            </p>
            <p>
              Thank you for visiting, and we look forward to sharing our journey
              of education, healthcare, and community service with you.
            </p>
          </div>
        </div>
      </div>

      <div className="footer-section">
        <div className="overlap-3">
          <footer className="footer">
            <div className="footer-bg" />
          </footer>
          <div className="links">
            <div className="text-wrapper-7">Quick Links:</div>
            <div className="link">
              <div className="text-wrapper-8">Admission</div>
              <div className="text-wrapper-9">News</div>
              <div className="text-wrapper-9">Calender</div>
              <div className="text-wrapper-9">FAQ</div>
            </div>
          </div>
          <div className="div-wrapper">
            <div className="text-wrapper-10">
              Copyright © 2024 MCCHST. All Rights Reserved.
              <div className="powered-text">
                Powered by:
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
          <div className="social-media">
            <div className="text-wrapper-11">Our Social Media:</div>
            <div className="frame-4">
              <img className="icons" alt="Icon telegram" src={telegramLogo} />
              <img className="icons" alt="Icon facebook" src={facebookLogo} />
              <img className="icons" alt="Icon twitter" src={twitterLogo} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
