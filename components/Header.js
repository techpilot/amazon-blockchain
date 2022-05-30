import React, { useContext, useState } from "react";
import { AmazonContext } from "../context/AmazonContext";
import logo from "../assets/amazon_logo_full.png";
import Image from "next/image";
import { CgMenuGridO } from "react-icons/cg";
import { IoMdSearch } from "react-icons/io";
import { FaCoins } from "react-icons/fa";
import "react-simple-hook-modal/dist/styles.css";
import BuyModal from "./BuyModal";
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: 800,
    height: 600,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const Header = () => {
  const styles = {
    container: `h-[60px] w-full flex items-center gap-5 px-16`,
    logo: `flex items-center ml-[20px] cursor-pointer flex-1`,
    search: `p-[25px] mr-[30px] w-[400px] h-[40px] bg-white rounded-full shadow-lg flex flex items-center border border-black`,
    searchInput: `bg-transparent focus:outline-none border-none flex-1 items-center flex`,
    menu: `flex items-center gap-6`,
    menuItem: `flex items-center text-md font-bold cursor-pointer`,
    coins: `ml-[10px]`,
  };

  const { balance } = useContext(AmazonContext);

  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div style={modalStyle} className={classes.paper}>
          <BuyModal setOpen={setOpen} />
        </div>
      </Modal>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Image
            src={logo}
            alt="amazon"
            height={100}
            width={100}
            className="object-cover"
          />
        </div>
        <div className={styles.search}>
          <input
            type="text"
            placeholder="Search Your Assets..."
            className={styles.searchInput}
          />
          <IoMdSearch className={styles.searchIcon} fontSize={20} />
        </div>
        <div className={styles.menu}>
          <div className={styles.menuItem}>New Releases</div>
          <div className={styles.menuItem}>Featured</div>
          {balance ? (
            <div
              className={(styles.balance, styles.menuItem)}
              onClick={() => setOpen(true)}
            >
              {balance}
              <FaCoins className={styles.coins} />
            </div>
          ) : (
            <div
              className={(styles.balance, styles.menuItem)}
              onClick={() => setOpen(true)}
            >
              0 AC <FaCoins className={styles.coins} />
            </div>
          )}
          <CgMenuGridO className={styles.menuItem} fontSize={30} />
        </div>
      </div>
    </div>
  );
};

export default Header;
