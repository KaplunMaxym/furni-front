import React from "react";
import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import PageHeader from "@/ui/page-header/PageHeader";
import packageJson from "@/../package.json";
import {dataVersionInformation} from "./data/dataVersionInformation";
import VersionInformationCard from "./features/versionInformationCard/VersionInformationCard";

const Version = () => {
    return (
        <MainLayout>
            <PageHeader
                title="Версія"
                description={`Поточне складання застосунку — v${packageJson.version}`}
            />
            {/*<div className={'flex flex-col gap-5 max-w-[1060px]'}>*/}
            {/*    {dataVersionInformation.map((item, index) =>*/}
            {/*        <VersionInformationCard key={index} {...item} />)*/}
            {/*    }*/}
            {/*</div>*/}
        </MainLayout>
    )
}

export default Version;