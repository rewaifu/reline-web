import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui";
import { useTranslation } from "react-i18next";
import { AVAILABLE_LANGUAGES } from "../i18n/languages-enum";
import {IconCheck, IconLanguage} from "@tabler/icons-react";
import React from "react";

export function LanguageSelect() {
    const { i18n } = useTranslation();
    const currentLang = AVAILABLE_LANGUAGES.find(l => l.code === i18n.language) || AVAILABLE_LANGUAGES[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Button variant="ghost" size="icon-lg" className="relative">
                    <IconLanguage/>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                {AVAILABLE_LANGUAGES.map(lang => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => i18n.changeLanguage(lang.code)}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center">
                            <span className={`fi ${lang.flag} mr-2`} />
                            {lang.label}
                        </div>
                        {i18n.language === lang.code && <IconCheck size={16} className="ml-2" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
