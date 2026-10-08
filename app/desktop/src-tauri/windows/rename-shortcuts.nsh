; Rename only shortcuts belonging to this exact installation; preserve custom shortcuts.
!macro RenameAdFontesShortcut DIRECTORY
  !insertmacro IsShortcutTarget "${DIRECTORY}\Ad Fontes NT.lnk" "$INSTDIR\${MAINBINARYNAME}.exe"
  Pop $0
  ${If} $0 = 1
    ${IfNot} ${FileExists} "${DIRECTORY}\${PRODUCTNAME}.lnk"
      Rename "${DIRECTORY}\Ad Fontes NT.lnk" "${DIRECTORY}\${PRODUCTNAME}.lnk"
    ${Else}
      !insertmacro IsShortcutTarget "${DIRECTORY}\${PRODUCTNAME}.lnk" "$INSTDIR\${MAINBINARYNAME}.exe"
      Pop $0
      ${If} $0 = 1
        Delete "${DIRECTORY}\Ad Fontes NT.lnk"
      ${EndIf}
    ${EndIf}
  ${EndIf}
!macroend

!macro NSIS_HOOK_POSTINSTALL
  !insertmacro RenameAdFontesShortcut "$SMPROGRAMS"
  !insertmacro RenameAdFontesShortcut "$DESKTOP"
!macroend
