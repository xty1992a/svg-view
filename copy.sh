#!/usr/bin/osascript
use framework "Appkit"

property this : a reference to current application
property NSFileManager : a reference to NSFileManager of this
property NSImage : a reference to NSImage of this
property NSMutableArray : a reference to NSMutableArray of this
property NSPasteboard : a reference to NSPasteboard of this
property NSString : a reference to NSString of this
property NSURL : a reference to NSURL of this

property pb : missing value

on run argv
init()
clearClipboard()
addToClipboard(argv)
end run


to init()
set pb to NSPasteboard's generalPasteboard()
end init

to clearClipboard()
if pb = missing value then init()
pb's clearContents()
end clearClipboard

to addToClipboard(fs)
local fs

set fURLs to NSMutableArray's array()
set FileManager to NSFileManager's defaultManager()

repeat with f in fs
if f's class = alias then set f to f's POSIX path
set pwd to (FileManager's currentDirectoryPath)
set fn to (NSString's stringWithString:f)
set fp to (pwd's stringByAppendingPathComponent:fn)'s stringByStandardizingPath()
if (FileManager's fileExistsAtPath:fp) then
(fURLs's addObject:(NSURL's fileURLWithPath:fp))
end if
end repeat

if pb = missing value then init()
pb's writeObjects:fURLs
end addToClipboard
