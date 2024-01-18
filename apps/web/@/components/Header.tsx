import Link from "next/link";
import { Input } from "./ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User, Search, ShoppingCart, Menu, NotepadText } from "lucide-react";
const Header = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-2 shadow-md ">
      <Link href="/" className="hidden text-3xl font-black md:block ">
        DevNotes
      </Link>
      <div className="relative w-full px-10 md:px-16  lg:px-48">
        <Input
          type="text"
          placeholder="Search..."
          className=" rounded-full border border-gray-300 py-2 pl-10 pr-10 outline-none focus:border-blue-500"
        />
        <Search className="absolute left-14 top-2 size-5 text-gray-400  md:left-20 lg:left-52" />
      </div>
      <div className="hidden items-center justify-center gap-6  md:flex">
        <Link href="/cart" className="flex gap-1 ">
          <ShoppingCart />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <Link href="#">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link href="#">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Your Orders</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className=" md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Menu size={32} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <Link href="#">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link href="#">
                <DropdownMenuItem>
                  <NotepadText className="mr-2 h-4 w-4" />

                  <span>Your Orders</span>
                </DropdownMenuItem>
              </Link>
              <Link href="#">
                <DropdownMenuItem>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  <span>Cart</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Header;
