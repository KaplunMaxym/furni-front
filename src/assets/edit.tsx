import { FC, SVGProps } from 'react';

const EditIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        {...props}
    >
        <path d="M5 18H6.425L16.2 8.225L14.775 6.8L5 16.575V18ZM3 20V15.75L16.2 2.575C16.4 2.39167 16.6208 2.25 16.8625 2.15C17.1042 2.05 17.3583 2 17.625 2C17.8917 2 18.15 2.05 18.4 2.15C18.65 2.25 18.8667 2.4 19.05 2.6L20.425 4C20.625 4.18333 20.7708 4.4 20.8625 4.65C20.9542 4.9 21 5.15 21 5.4C21 5.66667 20.9542 5.92083 20.8625 6.1625C20.7708 6.40417 20.625 6.625 20.425 6.825L7.25 20H3ZM15.475 7.525L14.775 6.8L16.2 8.225L15.475 7.525Z" />
    </svg>
);

export default EditIcon;